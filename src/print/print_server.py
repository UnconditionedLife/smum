#!/usr/bin/env python

from escpos import printer
import json
import argparse
import sys
import time

# TODO Embed logo in server code

## Websocket server

import asyncio
from websockets.server import serve

async def handler(websocket):
    log_trace(1, 'Connection start ' + str(websocket.remote_address))
    async for message in websocket:
        do_commands(message)
        await websocket.send('OK')
    log_trace(1, 'Connection end ' + str(websocket.remote_address))

async def server_main():
    async with serve(handler, '0.0.0.0', 8765):
        await asyncio.Future()  # run forever

def start_websocket_server():
    asyncio.run(server_main())

## Epson printer

def prn_open(printer_ip, filename):
    try:
        if printer_ip:
            return printer.Network(printer_ip, timeout=15, profile='TM-T88V')
        elif filename:
            return printer.File(filename, profile='TM-T88V')
        else:
            log_error('No print destination specified')
            return None
    except OSError as e:
        log_error('Failed to open printer: ' + e)
        return None

def prn_start_receipt():
    if prn:
        prn.image(img_source='small-logo.png', center=True)
    prn_feed(1)  
    prn_text_line('778 S. Almaden Avenue', align='center')
    prn_text_line('San Jose, CA 95110', align='center')
    prn_text_line('(408) 292-3314', align='center')

def prn_text_line(text, width=1, height=1, invert=False, align='center'):
	if prn:
		prn.set(custom_size=True, width=width, height=height, invert=invert,
            align=align)
		prn.textln(text)

def prn_feed(n):
    if prn:
        prn.print_and_feed(n)
	
def prn_end_receipt():
	if prn:
		prn.print_and_feed(2)
		prn.cut()

def do_commands(msg):
    cmd_list = json.loads(msg)
    log_trace(2, '--- Start Receipt ---')
    prn_start_receipt()
    for cmd in cmd_list:
        log_trace(2, '\t' + str(cmd))
        op = cmd.pop('op', None)
        if op == 'text':
            prn_text_line(**cmd)
        elif op == 'feed':
            prn_feed(**cmd)
        else:
            log_error('Invalid op:' + str(op))
    prn_end_receipt()
    log_trace(2, '--- End Receipt ---')

def prn_test_receipt():
    do_commands("""
        [
            {"op": "text", "text": "Left justified", "align": "left"},
            {"op": "text", "text": "Right justified", "align": "right"},
            {"op": "text", "text": "CENTER", "width": 2, "height": 2, 
                "invert": true, "align": "center"},
            {"op": "text", "text": "Last line", "align": "left"}
        ]
    """)

## Utility Functions

def log_trace(level, msg):
    if args.verbosity >= level:
        print(time.ctime(), 'TRACE', msg)

def log_error(msg):
    print(time.ctime(), 'ERROR', msg)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('-f', '--file', help='file to receive printer commands')
    parser.add_argument('-p', '--printer', help='IP address of Epson printer')
    parser.add_argument('-t', '--test', action='store_true',
        help='print test receipt and exit')
    parser.add_argument('-v', '--verbosity', type=int,
        default=0, help='level of debug tracing (0-2)')
    args = parser.parse_args()

    prn = prn_open(printer_ip=args.printer, filename=args.file)
    if not prn:
        sys.exit(1)

    if args.test:
        prn_test_receipt()
    else:
        if 0 < args.verbosity <= 2:
            sys.stdout = open('printlog_' + 
                time.strftime('%Y%m%d', time.localtime()) + '.txt', 'a')
            sys.stderr = sys.stdout
        log_trace(1, 'Print server start')
        try:
            start_websocket_server()
        except KeyboardInterrupt:
            pass
        log_trace(1, 'Print server exit')
    sys.exit(0)
