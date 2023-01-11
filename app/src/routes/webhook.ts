import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import * as line from "@line/bot-sdk";

const WebhookRouter = Router();

//"ご自身のchannel accsess token key";
// const getChannelSeacret = process.env.CHANNEL_SECRET;
// const getChannelAccessToken = process.env.CHANNEL_ACCESS_TOKEN;

const config:any = {
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
};

//不要なはず
// const app = express();

WebhookRouter.get("/",(req: any, res: any) => {
    return res.status(200).send({ message: "テスト成功" })
})

WebhookRouter.post(
  "/",
  line.middleware(config),
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

//不要なはず
// app.listen(PORT);
// console.log(`Server running at ${PORT}`);

// **** Export default **** //

export default WebhookRouter;