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

// 「ご褒美使う？」を問うボタンテンプレート　「使う！」、「もう少し頑張る！」、「貯める！」
export const useDeposit = (event: ReplyableEvent) => {
    const message: FlexMessage = {
        type: "flex",
        altText: "ご褒美使う？",
        contents: {
            type: "bubble",
            header: {
                type: "box",
                layout: "vertical",
                contents: [
                    {
                        type: "text",
                        text: "ご褒美使う？"
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
                            data: "keep",
                            displayText: "頑張れ！！",
                            label: "もう少し頑張る！"
                        }
                    },
                    {
                        type: "button",
                        action: {
                            type: "postback",
                            label: "貯める！",
                            data: "振替",
                            displayText: "ご褒美貯金をリセットするよ。"
                        }
                    },
                    {
                        type: "button",
                        action: {
                            type: "postback",
                            label: "使う！",
                            data: "useDeposit"
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