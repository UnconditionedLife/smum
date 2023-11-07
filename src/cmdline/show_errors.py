#!/usr/bin/env python

import argparse
import requests
from datetime import datetime
from datetime import timezone
import uuid
import json

url_base = 'https://hjfje6icwa.execute-api.us-west-2.amazonaws.com'

def retrieve(queue, start, end):
    url = f'{url_base}/{queue}/logs'
    # Convert start and end timespecs to UTC
    if start:
        start = datetime.fromisoformat(start).astimezone(timezone.utc).isoformat(timespec='seconds')
    if end:
        end = datetime.fromisoformat(end).astimezone(timezone.utc).isoformat(timespec='seconds')
    req = requests.get(url, params={'start': start, 'end': end})

    print(req.url)
    items = req.json()
    return items

def display(items):
    for msg in items:
        gmt_time = datetime.fromisoformat(msg['logTimestamp'])
        timestamp = gmt_time.astimezone().replace(tzinfo=None).isoformat(sep=' ')
        print(f"{timestamp}  {msg['message']}")

def delete(queue, items):
    url = f'{url_base}/{queue}/logs'
    for msg in items:
        print(f"DELETE {msg['logID']}")
        req = requests.delete(url, params={'logID': msg['logID']})

def add(queue, message):
    url = f'{url_base}/{queue}/logs'
    payload = {'message': message, 'logTimestamp': datetime.utcnow().isoformat(timespec='seconds') + 'Z', 
        'logID': str(uuid.uuid1()), 'category':'ERROR'}
    req = requests.post(url, data=json.dumps(payload))

def confirm(prompt):
    resp = input(prompt)
    return resp.upper().startswith('Y')

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('-s', '--start', 
        help='starting timestamp')
    parser.add_argument('-e', '--end', 
        help='ending timestamp')
    parser.add_argument('-q', '--queue', 
        default='prod', choices=('prod', 'dev'), help='error queue (dev or prod)')
    parser.add_argument('-d', '--delete', action='store_true',
        help='delete messages')
    parser.add_argument('-m', '--message', 
        help='add new message to error queue')
    args = parser.parse_args()

    if args.message:
        add(args.queue, args.message)
    else:
        msgs = retrieve(args.queue, args.start, args.end)
        display(msgs)
        if args.delete and len(msgs) > 0 and confirm(f'Delete {len(msgs)} message(s) (Y/N)?'):
            delete(args.queue, msgs)