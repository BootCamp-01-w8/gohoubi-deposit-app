import { Router } from "express";
import * as line from "@line/bot-sdk";

const WebhookRouter = Router();


const config:any = {
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
};

WebhookRouter.use("/webhook", line.middleware(config));


WebhookRouter.get("/",(req: any, res: any) => {
    
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

async function handleEvent(event:any) {
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }

  /* -------------------------------------------
    ------- 返信メッセージの処理の記述ゾーン ---------
    ------------------------------------------- */

  let replyText = "";
  replyText = event.message.text; // event.message.textに自分のメッセージが入っている。

  /* ------------------------------------------
    ------------------------------------------
    ------------------------------------------ */

  return client.replyMessage(event.replyToken, {
    type: "text",
    text: replyText,
  });
}


// **** Export default **** //

export default WebhookRouter;