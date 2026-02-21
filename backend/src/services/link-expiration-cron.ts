import cron from "node-cron";
import { Server } from "socket.io";
import { UrlModel } from "../models/url.model";
import { UserModel } from "../models/user.model";
import { LinkStatus } from "../types/link-status.enum";

const migrateExistingLinks = async () => {
  try {
    const result = await UrlModel.updateMany(
      { status: { $exists: false } },
      {
        $set: {
          status: LinkStatus.ACTIVE,
          deleteAfterExpiredDays: 30,
        },
      }
    );
    if (result.modifiedCount > 0) {
      console.log(
        `[Cron] Migrated ${result.modifiedCount} links to active status`
      );
    }
  } catch (error) {
    console.error("[Cron] Migration error:", error);
  }
};

const emitLinksUpdated = (
  io: Server,
  userId: string,
  type: 'expired' | 'deleted',
  linkIds: string[]
) => {
  io.to(userId).emit('links:updated', { type, linkIds, userId });
  console.log(`[Cron] Emitted links:updated (${type}) to user ${userId}: ${linkIds.length} link(s)`);
};

const markExpiredLinks = async (io: Server) => {
  try {
    const now = new Date();
    const query = {
      status: LinkStatus.ACTIVE,
      $or: [
        { expirationDate: { $lt: now, $ne: null } },
        { planExpiresAt: { $lt: now, $ne: null } },
      ],
    };

    // Fetch only what we need for socket emission (lean = plain objects, faster)
    const linksToExpire = await UrlModel.find(query, { _id: 1, user: 1 }).lean();

    if (linksToExpire.length === 0) return;

    await UrlModel.updateMany(query, { $set: { status: LinkStatus.EXPIRED, expiredAt: now } });

    console.log(`[Cron] Marked ${linksToExpire.length} links as expired`);

    // Group by userId and emit once per user
    const byUser = new Map<string, string[]>();
    for (const link of linksToExpire) {
      const userId = link.user.toString();
      if (!byUser.has(userId)) byUser.set(userId, []);
      byUser.get(userId)!.push(link._id.toString());
    }
    for (const [userId, linkIds] of byUser) {
      emitLinksUpdated(io, userId, 'expired', linkIds);
    }
  } catch (error) {
    console.error("[Cron] Error marking expired links:", error);
  }
};

const hardDeleteExpiredLinks = async (io: Server) => {
  try {
    const expiredLinks = await UrlModel.find({
      status: LinkStatus.EXPIRED,
      expiredAt: { $ne: null },
      deleteAfterExpiredDays: { $ne: null },
    });

    const now = Date.now();
    const byUser = new Map<string, string[]>();

    for (const link of expiredLinks) {
      const retentionMs = link.deleteAfterExpiredDays * 86400000;
      const expiredAtMs = new Date(link.expiredAt).getTime();

      if (now - expiredAtMs > retentionMs) {
        // findOneAndDelete triggers the post hook for Analytics/Visit cleanup
        await UrlModel.findOneAndDelete({ _id: link._id });

        await UserModel.findByIdAndUpdate(link.user, {
          $pull: { shortLinks: link._id },
        });

        const userId = link.user.toString();
        if (!byUser.has(userId)) byUser.set(userId, []);
        byUser.get(userId)!.push(link._id.toString());
      }
    }

    const deletedCount = [...byUser.values()].reduce((sum, ids) => sum + ids.length, 0);
    if (deletedCount > 0) {
      console.log(`[Cron] Hard deleted ${deletedCount} expired links, Ids: $${byUser.values()}`);
      for (const [userId, linkIds] of byUser) {
        emitLinksUpdated(io, userId, 'deleted', linkIds);
      }
    }
  } catch (error) {
    console.error("[Cron] Error deleting expired links:", error);
  }
};

export const startLinkExpirationCron = (io: Server) => {
  // Run migration on boot
  migrateExistingLinks();

  // Run daily at 2:00 AM
  cron.schedule("2 0 * * *", async () => {
    console.log("[Cron] Running link expiration check...");
    await markExpiredLinks(io);
    await hardDeleteExpiredLinks(io);
    console.log("[Cron] Link expiration check complete.");
  });

  console.log("[Cron] Link expiration cron job registered (daily at 2:00 AM)");
};
