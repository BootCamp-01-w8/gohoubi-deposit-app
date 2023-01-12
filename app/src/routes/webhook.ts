import { Router } from "express";
import * as line from "@line/bot-sdk";
import { TemplateMessage } from "@line/bot-sdk";
import { balancesService } from "@src/services/sunabar-service";
import { transferService } from "@src/services/sunabar-transfer";

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

async function handleEvent(event: any) {
  if (event.type !== "message" || event.message.type !== "text") {
    // ここでポストバック用の分岐も作る。
    console.log("テキストじゃない");
    return Promise.resolve(null);
  } else if (event.message.text === "残高") {
    // 残高照会

  } else if (event.message.text === "疲れた" && rootBalance < 1000) {
    // 500円振替
    return client.replyMessage(event.replyToken, [
      {
        type: "text",
        text: `${resPaymentAmount}円をごほうび貯金したよ！`, // 振替金額
      },
      {
        type: "text",
        text: "おつかれさま！ゆっくりやすんでね。",
      },
    ]);

  } else if (event.message.text === "つらい" && rootBalance < 1000) {
    // 1000円振替
    return client.replyMessage(event.replyToken, [
      {
        type: "text",
        text: `${resPaymentAmount}円をごほうび貯金したよ！`, // 振替金額
      },
      {
        type: "text",
        text: "大変だったね！次のごほうびは何がいいかな？考えてみて。",
      },
    ]);

  } else if (event.message.text === ("疲れた" || "つらい") && rootBalance < 1000) {
    // 残高不足
    return client.replyMessage(event.replyToken, [
      {
        type: "text",
        text: "おつかれさま！残高不足で、ごほうび貯金できなかったよ",
      },
      {
        type: "text",
        text: `残高は、親口座：${rootBalance}円、ごほうび口座：${childBalance}円だよ。ゆっくり休んでね`,
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
    const resMessage = await transferService(event.message.text);

    return client.replyMessage(event.replyToken, {
      type: "text",
      text: resMessage,
    });
  }
  return useDeposit(event);
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
