import { Router } from "express";
import * as line from "@line/bot-sdk";
import { TemplateMessage } from '@line/bot-sdk';
import { balancesService } from "@src/services/sunabar-service";

const WebhookRouter = Router();


const config: any = {
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
};

WebhookRouter.use("/webhook", line.middleware(config));


WebhookRouter.get("/", (req: any, res: any) => {

  return res.status(200).send({ message: "テスト成功" })
})

WebhookRouter.post(
  "/",
  (req: any, res: any) => {
    console.log(req.body.events);

    Promise.all(req.body.events.map(handleEvent)).then((result) =>
      res.json(result)
    );
  }
);

const client = new line.Client(config);

async function handleEvent(event: any) {
  if (event.type !== "message" || event.message.type !== "text") {
    // ここでポストバック用の分岐も作る。
    console.log("テキストじゃない")
    return Promise.resolve(null);
  } else if (event.message.text === "使う") {
    console.log(event);
    let replyText = "";
    replyText = event.message.text;
    const response = await balancesService.get("/")

    console.log(response.data);
    const rootBalance = response.data.spAccountBalances[0].odBalance;
    const childBalance = response.data.spAccountBalances[1].odBalance;


    return client.replyMessage(event.replyToken, {
      type: "text",
      text: `親口座：${rootBalance},子口座：${childBalance}`
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
          data: "action=buy&itemid=123"
        },
        {
          type: "postback",
          label: "Add to cart",
          data: "action=add&itemid=123"
        },
        {
          type: "uri",
          label: "View detail",
          uri: "http://example.com/page/123"
        }
      ]
    }
  }
  return client.replyMessage(event.replyToken, param);
}


// **** Export default **** //

export default WebhookRouter;