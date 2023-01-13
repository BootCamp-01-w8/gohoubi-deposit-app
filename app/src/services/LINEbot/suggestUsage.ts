import { Router } from "express";
import * as line from "@line/bot-sdk";
import { ReplyableEvent, FlexMessage } from '@line/bot-sdk';

const WebhookRouter = Router();
const config: any = {
    channelSecret: process.env.CHANNEL_SECRET,
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
};

WebhookRouter.use("/webhook", line.middleware(config));
const client = new line.Client(config);

// 「何に使う？」を問うボタンテンプレート　「ショッピング」、「旅行」、「ごはん」
export const suggestUsage = (event: ReplyableEvent) => {
    const message: any = {
        type: "flex",
        altText: "何に使う？",
        contents: {
            type: "bubble",
            header: {
                type: "box",
                layout: "vertical",
                contents: [
                    {
                        type: "text",
                        text: "何に使う？"
                    }
                ]
            },
            body: {
                type: "box",
                layout: "vertical",
                contents: [
                    {
                        type: "button",
                        action: {
                            type: "postback",
                            data: "shopping",
                            displayText: "何か買う！",
                            label: "お買い物"
                        }
                    },
                    {
                        type: "button",
                        action: {
                            type: "postback",
                            data: "eat",
                            displayText: "美味しいもの食べる！",
                            label: "ごはん",
                        }
                    },
                    {
                        type: "button",
                        action:  {
                            type: "postback",
                            data: "travel",
                            displayText: "旅行に行く！",
                            label: "旅行",
                        }
                    },
                    {
                        type: "button",
                        action: {
                            type: "postback",
                            data: "transfer",
                            label: "振込",
                            inputOption: "openKeyboard",
                            fillInText: "301-0000017に50000円振込" 
                        }
                    }
                ]
            },
            styles: {
                body: {
                    separator: false
                }
            }

        }
    }
    return client.replyMessage(event.replyToken, message);
}
