import psycopg2
import json

conn_str = 'postgresql://postgres.pccxdiiapwoasjcjuwaf:Bnc200312345!@aws-0-eu-west-2.pooler.supabase.com:6543/postgres?sslmode=require'
conn = psycopg2.connect(conn_str)
cur = conn.cursor()

# 1. Check real tickets in api_ticket
cur.execute('SELECT id, event_id, quantity, total_price, ticket_type FROM api_ticket;')
real_tickets = cur.fetchall()
print(f'Total real tickets in api_ticket: {len(real_tickets)}')

# 2. Get all events
cur.execute('SELECT id, title, ticket_tiers FROM api_event;')
events = cur.fetchall()

for ev_id, title, tiers in events:
    ev_tickets = [t for t in real_tickets if str(t[1]) == str(ev_id)]
    real_sold = sum(t[2] or 1 for t in ev_tickets)

    updated_tiers = []
    tiers_list = tiers
    if isinstance(tiers, str):
        try:
            tiers_list = json.loads(tiers)
        except Exception:
            tiers_list = []

    if isinstance(tiers_list, list):
        for tier in tiers_list:
            t_copy = dict(tier)
            tier_sold = sum(t[2] or 1 for t in ev_tickets if t[4] == t_copy.get('name') or str(t_copy.get('id')) == str(t[4]))
            t_copy['sold'] = tier_sold
            updated_tiers.append(t_copy)

    cur.execute(
        'UPDATE api_event SET tickets_sold = %s, ticket_tiers = %s WHERE id = %s;',
        (real_sold, json.dumps(updated_tiers), ev_id)
    )
    print(f'Updated event "{title}": tickets_sold = {real_sold}')

conn.commit()
conn.close()
print('Successfully reset all fake ticket sales in Supabase to real data!')

import re
p = 'kundwa-backend/seed_events.py'
c = open(p, encoding='utf-8').read()
c = re.sub(r'"tickets_sold":\s*\d+', '"tickets_sold": 0', c)
c = re.sub(r'"sold":\s*\d+', '"sold": 0', c)
open(p, 'w', encoding='utf-8').write(c)
print('Successfully reset seed_events.py to 0!')

