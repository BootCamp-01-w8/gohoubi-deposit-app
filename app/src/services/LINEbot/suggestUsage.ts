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
    const message: FlexMessage = {
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
                            displayText: "お買い物",
                            label: "shopping"
                        }
                    },
                    {
                        type: "button",
                        action: {
                            type: "postback",
                            data: "eat",
                            displayText: "ごはん",
                            label: "eat",
                        }
                    },
                    {
                        type: "button",
                        action: {
                            type: "postback",
                            data: "travel",
                            displayText: "旅行",
                            label: "travel",
                        }
                    },
                    {
                        type: "button",
                        action: {
                            type: "postback",
                            data: "transfer",
                            displayText: "振込",
                            label: "transfer",
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
