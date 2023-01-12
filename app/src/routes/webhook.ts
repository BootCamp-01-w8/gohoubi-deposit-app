import { Router } from "express";
import * as line from "@line/bot-sdk";
import { WebhookEvent ,TemplateMessage} from '@line/bot-sdk';
import { balancesService } from "@src/services/sunabar/sunabar-service";
import { useDeposit } from "@src/services/LINEbot/use-deposit";
import { suggestUsage } from "@src/services/LINEbot/suggestUsage";
import { transferService } from "@src/services/sunabar/sunabar-transfer";

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

async function handleEvent(event: WebhookEvent) {
  // postback　
  if(event.type === "postback") {
    console.log("postback")
    if(event.postback.data === "useDeposit"){
      return suggestUsage(event);
    } else if (event.postback.data === "shopping"){
      // 楽天
      console.log("楽天");
      return client.replyMessage(event.replyToken, {
        type: "text",
        text: "楽天",
      });
    } else if (event.postback.data === "eat"){
      // 食べログ
      console.log("食べログ");
      return client.replyMessage(event.replyToken, {
        type: "text",
        text: "食べログ",
      });
    } else if (event.postback.data === "travel"){
      // じゃらん
      console.log("じゃらん");
      return client.replyMessage(event.replyToken, {
        type: "text",
        text: "じゃらん",
      });
    } else if (event.postback.data === "transfer"){
      // 振込
      console.log("振込");
      return client.replyMessage(event.replyToken, {
        type: "text",
        text: "振込",
      });
    }
  } 
  if (event.type !== "message" || event.message.type !== "text") {
    console.log("テキストじゃない");
    return Promise.resolve(null);
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




// **** Export default **** //

export default WebhookRouter;
