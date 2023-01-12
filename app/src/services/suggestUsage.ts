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
    
}
