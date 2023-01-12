import { Router } from "express";
import * as line from "@line/bot-sdk";

import { transferService } from "@src/services/sunabar/sunabar-transfer";
import { spAccountsTransfer } from "@src/services/sunabar/spAccounts";
import { WebhookEvent, TemplateMessage } from "@line/bot-sdk";
import {
  balancesService,
  selfTransferService100,
  selfTransferService1000,
} from "@src/services/sunabar/sunabar-service";
import { useDeposit } from "@src/services/LINEbot/use-deposit";
import { postback } from "@src/services/LINEbot/postback";

const WebhookRouter = Router();

const config: any = {
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
};

WebhookRouter.use("/webhook", line.middleware(config));

WebhookRouter.get("/", (req: any, res: any) => {
  return res.status(200).send({ message: "テスト成功" });
});

WebhookRouter.post("/", (req: any, res: any) => {
  console.log(req.body.events);
  Promise.all(req.body.events.map(handleEvent)).then((result) =>
    res.json(result)
  );
});

const client = new line.Client(config);

async function handleEvent(event: WebhookEvent) {
  // 残高照会
  const balancesResponse = await balancesService.get("/"); //残高照会API呼び出し
  const rootBalance = balancesResponse.data.spAccountBalances[0].odBalance; //親口座残高
  const childBalance = balancesResponse.data.spAccountBalances[1].odBalance; //子口座残高
  console.log(balancesResponse.data); // test

  // postback
  if (event.type === "postback") {
    console.log("postback");
    return postback(event);
  }
  if (event.type !== "message" || event.message.type !== "text") {
    console.log("テキストじゃない");
    return Promise.resolve(null);

  } else if (event.message.text === "残高") {
    return client.replyMessage(event.replyToken, [
      {
        type: "text",
        text: `残高は、親口座：${rootBalance}円、ごほうび口座：${childBalance}円だよ。`,
      },
    ]);

  } else if (event.message.text === "疲れた" && rootBalance >= 1000) {
    // ごほうび口座へ振替API呼び出し 100円
    request(selfTransferService100, function (error: any, selfTransferResponse: { body: string; }) {
      if (error) throw new Error(error);
      const responsePaymentAmount = JSON.parse(
        selfTransferResponse.body
      ).paymentAmount; // 振替金額
      return client.replyMessage(event.replyToken, [
        {
          type: "text",
          text: `${responsePaymentAmount}円をごほうび貯金したよ`,
        },
        {
          type: "text",
          text: "おつかれさま！ゆっくりやすんでね。",
        },
      ]);
    });

  } else if (event.message.text === "つらい" && rootBalance >= 1000) {
    // ごほうび口座へ振替API呼び出し 1000円
    request(selfTransferService1000, function (error: any, selfTransferResponse: { body: string; }) {
      if (error) throw new Error(error);
      const responsePaymentAmount = JSON.parse(
        selfTransferResponse.body
      ).paymentAmount; // 振替金額
      return client.replyMessage(event.replyToken, [
        {
          type: "text",
          text: `${responsePaymentAmount}円をごほうび貯金したよ`,
        },
        {
          type: "text",
          text: "大変だったね！次のごほうびは何がいいかな？考えてみて。",
        },
      ]);
    });

  } else if (
    event.message.text === ("疲れた" || "つらい") &&
    rootBalance < 1000
  ) {
    // 残高不足
    return client.replyMessage(event.replyToken, [
      {
        type: "text",
        text: "おつかれさま！残高が1000円未満なので、ごほうび貯金しなかったよ",
      },
      {
        type: "text",
        text: `残高は、親口座：${rootBalance}円、ごほうび口座：${childBalance}円だよ。`,
      },
    ]);

  } else if (event.message.text === "使う") {
    console.log(event);
    let replyText = "";
    replyText = event.message.text;
    const response = await balancesService.get("/");

    console.log(response.data);
    const rootBalance = response.data.spAccountBalances[0].odBalance;
    const childBalance = response.data.spAccountBalances[1].odBalance;

    return client.replyMessage(event.replyToken, {
      type: "text",
      text: `親口座：${rootBalance},子口座：${childBalance}`,
    });

    //振込依頼 "301-0000017に50000円振込"金額は変更可
  } else if (
    /^(?=.*\d{3}-?\d{7})(?=.*円)(?=.*振?込)/.test(event.message.text)
  ) {
    /* text整形 */
    //支店番号
    let strMatch: any = event.message.text.match(/\d{3}-?\d{7}/);
    const beneficiaryBranchCode = strMatch[0].slice(0, 3);
    //口座番号
    const accountNumber = strMatch[0].slice(4);
    //振込額
    const sliceText = event.message.text.replace(/\d{3}-?\d{7}/, "");
    strMatch = sliceText.match(/[0-9]+/);
    const transferAmount = strMatch[0];

    /* 残高照会 */
    const response = await balancesService.get("/");
    const childBalance = response.data.spAccountBalances[1].odBalance;
    console.log("ご褒美", childBalance);
    console.log("振込", transferAmount);

    let resMessage = "";
    /* 振込額 < 残高 判定 */
    if (Number(transferAmount) < Number(childBalance)) {
      resMessage = await transferService(
        beneficiaryBranchCode,
        accountNumber,
        transferAmount
      );

      //振込額を親口座に振替
      const childSpAcId = "SP50220329019";
      const parentSpAcId = "SP30110005951";
      spAccountsTransfer(parentSpAcId, childSpAcId, transferAmount);

      return client.replyMessage(event.replyToken, {
        type: "text",
        text: resMessage,
      });
    } else {
      resMessage = "ざんねん！残高不足だよ";
      return client.replyMessage(event.replyToken, {
        type: "text",
        text: resMessage,
      });
    }
  }
  return useDeposit(event);
}

// **** Export default **** //

export default WebhookRouter;
