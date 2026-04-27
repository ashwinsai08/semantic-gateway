import { Injectable } from "@nestjs/common";

@Injectable()
export class IntentService {

  extractCategory(query: string): string | undefined {
    const q = query.toLowerCase();

    if (q.match(/return|refund|send back|exchange/)) {
      return 'returns';
    }
    if (q.match(/ship|deliver|dispatch|tracking|arrive/)) {
      return 'shipping';
    }
    if (q.match(/cancel|cancellation|stop order/)) {
      return 'cancellation';
    }

    return undefined;  // no filter → search all
  }
}