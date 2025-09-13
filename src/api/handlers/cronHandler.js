// src/api/handlers/cronHandler.js

export class CronHandler {
  constructor(env, supabase) {
    this.env = env;
    this.supabase = supabase;
  }

  async handle() {
    console.log('Cron job started: Checking for expired subscriptions...');
    const now = new Date().toISOString();

    try {
      // 1. Find all active subscriptions where the end_date is in the past
      const { data: expiredSubscriptions, error: fetchError } = await this.supabase
        .from('user_subscriptions')
        .select('id')
        .eq('status', 'active')
        .lt('end_date', now);

      if (fetchError) {
        throw new Error(`Failed to fetch expired subscriptions: ${fetchError.message}`);
      }

      if (!expiredSubscriptions || expiredSubscriptions.length === 0) {
        console.log('No expired subscriptions found. Cron job finished.');
        return;
      }

      const idsToExpire = expiredSubscriptions.map(sub => sub.id);

      // 2. Update the status of these subscriptions to 'inactive'
      const { error: updateError } = await this.supabase
        .from('user_subscriptions')
        .update({ status: 'inactive' })
        .in('id', idsToExpire);

      if (updateError) {
        throw new Error(`Failed to update subscriptions: ${updateError.message}`);
      }

      console.log(`Successfully expired ${idsToExpire.length} subscriptions. Cron job finished.`);

    } catch (error) {
      console.error('Error during cron job execution:', error);
    }
  }
}
