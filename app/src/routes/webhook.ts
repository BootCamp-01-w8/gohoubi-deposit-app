import { Router } from "express";
import * as line from "@line/bot-sdk";
import { WebhookEvent } from "@line/bot-sdk";

import { transferService } from "@src/services/sunabar/sunabar-transfer";
import { spAccountsTransfer } from "@src/services/sunabar/spAccounts";


import { postback } from "@src/services/LINEbot/postback";
import { textMessage } from "@src/services/LINEbot/textMessage";
import { transfer } from "@src/services/LINEbot/transfer";

const WebhookRouter = Router();

const config: any = {
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
};

WebhookRouter.use("/webhook", line.middleware(config));

WebhookRouter.post("/", (req: any, res: any) => {
  console.log(req.body.events);
  Promise.all(req.body.events.map(handleEvent)).then((result) =>
    res.json(result)
  );
});

const client = new line.Client(config);

async function handleEvent(event: WebhookEvent) {

  /* 「使う？」ルートから返ってくるpostbackイベントへの対応ルート */
  if (event.type === "postback") {
    console.log("postback");
    return postback(event);
  
  /* postback以外でテキストメッセージ以外のイベントへの対応ルート */
  } else if (event.type !== "message" || event.message.type !== "text") {
  return Promise.resolve(null);

  /* 「何に使う？」から「振込」を選択したときの返りへの対応 */
  /* 振込依頼 "301-0000017に50000円振込"金額は変更可*/
  } else if (/^(?=.*\d{3}-?\d{7})(?=.*円)(?=.*振?込)/.test(event.message.text)) {
    transfer(event);
  
  /* 振込依頼以外のテキストメッセージへの対応ルート*/
  } else {
    textMessage(event);
  };
}

// **** Export default **** //

export default WebhookRouter;
