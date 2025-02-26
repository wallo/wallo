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
                console.log(`Platform ${platformId} not found`);
                message.ack();
                return;
            }

            console.log(`Informing platform of action`, moderationPlatform.callbackUrl);
            const result = await informPlaformOfAction(
                {
                    url: new URL(moderationPlatform.callbackUrl),
                    secret: moderationPlatform.secret
                },
                message.body.case.kind,
                message.body.case.id,
                message.body.action
            );

            if (!result.valid) {
                console.log(`Failed to inform platform of action: ${result.error.message}`);
                message.retry({
                    delaySeconds: 60
                });
            } else {
                console.log(`Informed platform of action`);
                message.ack();
            }
        }
    }
} satisfies ExportedHandler<Env, PlatformNotificationEvent>;
