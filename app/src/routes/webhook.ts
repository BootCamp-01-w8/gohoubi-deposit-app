import { Router } from "express";
import * as line from "@line/bot-sdk";
import { TemplateMessage } from "@line/bot-sdk";
import { balancesService } from "@src/services/sunabar-service";
import { transferService } from "@src/services/sunabar/sunabar-transfer";
import { spAccountsTransfer } from "@src/services/sunabar/spAccounts";


const WebhookRouter = Router();

const config: any = {
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
};

WebhookRouter.use("/webhook", line.middleware(config));

WebhookRouter.get("/", (req: any, res: any) => {
  spAccountsTransfer("SP50220329019","SP30110005951", 50000);
  return res.status(200).send({ message: "テスト成功" });
});

WebhookRouter.post("/", (req: any, res: any) => {
  console.log(req.body.events);

  Promise.all(req.body.events.map(handleEvent)).then((result) =>
    res.json(result)
  );
});

const client = new line.Client(config);

async function handleEvent(event: any) {
  if (event.type !== "message" || event.message.type !== "text")
  {
    // ここでポストバック用の分岐も作る。
    console.log("テキストじゃない");
    return Promise.resolve(null);
  } else if (event.message.text === "使う")
  {
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
  )
  {
    /* text整形 */
    //支店番号
    const beneficiaryBranchCode = event.message.text
      .match(/\d{3}-?\d{7}/)[0]
      .slice(0, 3);
    //口座番号
    const accountNumber = event.message.text.match(/\d{3}-?\d{7}/)[0].slice(4);
    //振込額
    const sliceText = event.message.text.replace(/\d{3}-?\d{7}/, "");
    const transferAmount = sliceText.match(/[0-9]+/)[0];

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
    //貯める！場合の処理を一旦ここに記載しました
  } else if (event.message.text == "貯める")
  {
    /* 残高照会 */
    const response = await balancesService.get("/");
    const childBalance = response.data.spAccountBalances[1].odBalance;

    /* 残高を親口座に振替*/
    const childSpAcId = "SP50220329019";
    const parentSpAcId = "SP30110005951";
    spAccountsTransfer(parentSpAcId, childSpAcId, childBalance);

    let resMessage = `親口座に${Number(childBalance).toLocaleString()}円振替したよ`;
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: resMessage,
    });

  } return useDeposit(event);
}

// 「ご褒美使う？」を問うボタンテンプレート　「使う！」、「もう少し頑張る！」、「貯める！」
const useDeposit = (event: any) => {
  const param: TemplateMessage = {
    type: "template",
    altText: "This is a buttons template",
    template: {
      type: "buttons",
      thumbnailImageUrl: "https://example.com/bot/images/image.jpg",
      imageAspectRatio: "rectangle",
      imageSize: "cover",
      imageBackgroundColor: "#FFFFFF",
      title: "Menu",
      text: "Please select",
      actions: [
        {
          type: "postback",
          label: "Buy",
          data: "action=buy&itemid=123",
        },
        {
          type: "postback",
          label: "Add to cart",
          data: "action=add&itemid=123",
        },
        {
          type: "uri",
          label: "View detail",
          uri: "http://example.com/page/123",
        },
      ],
    },
  };
  return client.replyMessage(event.replyToken, param);
};

// **** Export default **** //

export default WebhookRouter;
