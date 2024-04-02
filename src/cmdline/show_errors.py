#!/usr/bin/env python

import argparse
import requests
from datetime import datetime
from datetime import timezone
import uuid
import json

url_base = 'https://hjfje6icwa.execute-api.us-west-2.amazonaws.com'

def retrieve(queue, start, end, level):
    url = f'{url_base}/{queue}/logs'
    # Convert start and end timespecs to UTC
    if start:
        start = datetime.fromisoformat(start).astimezone(timezone.utc).isoformat(timespec='seconds')
    if end:
        end = datetime.fromisoformat(end).astimezone(timezone.utc).isoformat(timespec='seconds')
    req = requests.get(url, params={'start': start, 'end': end, 'category': level.upper()})

    print(req.url)
    items = req.json()
    return items

def display(items):
    for msg in items:
        gmt_time = datetime.fromisoformat(msg['logTimestamp'])
        timestamp = gmt_time.astimezone().replace(tzinfo=None).isoformat(sep=' ', timespec='seconds')
        print(f"{timestamp}  {msg['message']}")

def delete(queue, items):
    url = f'{url_base}/{queue}/logs'
    for msg in items:
        r = requests.delete(url, params={'logID': msg['logID']})
        if r.status_code != 200:
            print(f"Failed to delete {msg['logID']}")

def add(queue, message, level):
    url = f'{url_base}/{queue}/logs'
    payload = {'message': message, 'logTimestamp': datetime.utcnow().isoformat(timespec='seconds') + 'Z', 
        'logID': str(uuid.uuid1()), 'category': level.upper()}
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
    parser.add_argument('-l', '--level', 
        default='error', choices=('error', 'trace'), help='message category (trace or error)')
    args = parser.parse_args()

    if args.message:
        add(args.queue, args.message, args.level)
    else:
        msgs = retrieve(args.queue, args.start, args.end, args.level)
        display(msgs)
        if args.delete and len(msgs) > 0 and confirm(f'Delete {len(msgs)} message(s) (Y/N)?'):
            delete(args.queue, msgs)