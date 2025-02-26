import { informPlaformOfAction } from '../../../src/lib/api';
import { getModerationPlatform } from '../../../src/lib/database';
import type { PlatformNotificationEvent } from '../../../src/lib/types';

export default {
    async queue(batch, env): Promise<void> {
        const messages = batch.messages;
        for (const message of messages) {
            const platformId = message.body.platformId;
            const moderationPlatform = await getModerationPlatform(platformId, { env });
            if (!moderationPlatform) {
                message.ack();
                return;
            }
            const result = await informPlaformOfAction(
                {
                    url: new URL(moderationPlatform.callbackUrl),
                    secret: moderationPlatform.secret
                },
                message.body.case.id,
                message.body.case.kind,
                message.body.action
            );

            if (!result.valid) {
                message.retry({
                    delaySeconds: 60
                });
            } else {
                message.ack();
            }
        }
    }
} satisfies ExportedHandler<Env, PlatformNotificationEvent>;
