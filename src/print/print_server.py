#!/usr/bin/env python

import json
import argparse
import sys
import time

# TODO Embed logo in server code

## Receipt printing (on-screen and Epson printer)

from escpos import printer
import tkinter as tk
from tkinter import font
from PIL import Image, ImageTk

def prn_open(printer_ip, filename):
    if args.interactive:
        return {'onscreen': True, 'handle': None}
    try:
        if printer_ip:
            h = printer.Network(printer_ip, timeout=15, profile='TM-T88V')
            return {'onscreen': False, 'handle': h}
        elif filename:
            h = printer.File(filename, profile='TM-T88V')
            return {'onscreen': False, 'handle': h}
        else:
            log_error('No print destination specified')
            return None
    except OSError as e:
        log_error('Failed to open printer: ' + e)
        return None

def prn_close():
    if not prn['onscreen']:
        prn['handle'].close()

def prn_start_receipt():
    if prn['onscreen']:
        prn['handle'] = tk.Tk()
        prn['handle'].geometry('+100+100')
        prn['handle'].title("Receipt")
        prn['handle'].configure(bg="white")

        render = ImageTk.PhotoImage(Image.open("small-logo.png"))
        logo = tk.Label(prn['handle'], image=render)
        logo.image = render
        logo.pack()
    else:
        prn['handle'].image(img_source='small-logo.png', center=True)
    prn_text_line('778 S. Almaden Avenue', align='center')
    prn_text_line('San Jose, CA 95110', align='center')
    prn_text_line('(408) 292-3314', align='center')

def prn_text_line(text, width=1, height=1, invert=False, align='center'):
    if prn['onscreen']:
        if width > 1 or height > 1:
            font = ("Courier", "24", "")
        else:
            font = ("Courier", "12", "")
        if invert:
            fg = 'white'
            bg = 'black'
        else:
            fg = 'black'
            bg = 'white'
        line = tk.Label(prn['handle'], text=text, bg=bg, fg=fg, font=font)
        if align == 'left':
            line.pack(anchor='nw')
        elif align == 'right':
            line.pack(anchor='ne')
        else:
            line.pack()
    else:
        prn['handle'].set(custom_size=True, width=width, height=height, invert=invert, align=align)
        prn['handle'].textln(text)

def prn_feed(n):
    if prn['onscreen']:
        feed = tk.Label(prn['handle'], text='\n' * (n-1), bg='white', font=("Courier", "12", ""))
        feed.pack()
    else:
        prn['handle'].print_and_feed(n)
	
def prn_end_receipt():
    prn_feed(2)
    if prn['onscreen']:
        # Create and place a button
        button = tk.Button(prn['handle'], text='Close', fg='red', command=prn_close_window)
        button.pack(side='bottom')
        # Start the GUI event loop
        prn['handle'].mainloop()
    else:
        prn['handle'].cut()

def prn_close_window():
    prn['handle'].destroy()
    prn['handle'].update()

def print_receipt(msg):
    global prn
    prn = prn_open(printer_ip=args.printer, filename=args.file)
    if not prn:
        return
    try:
        cmd_list = json.loads(msg)
    except Exception as e:
        log_error(f'Invalid receipt: {e}')
        log_error(msg)
        return
    log_trace(2, '--- Start Receipt ---')
    try:
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
    except Exception as e:
        log_error(f'Exception while printing: {e}')
    log_trace(2, '--- End Receipt ---')
    prn_close()

def prn_test_receipt():
    rcpt = [
        {"op": "text", "text": "Left justified", "align": "left"},
        {"op": "text", "text": "Right justified", "align": "right"},
        {"op": "text", "text": "CENTER", "width": 2, "height": 2, 
            "invert": True, "align": "center"},
        {"op": "text", "text": "Last line", "align": "left"}
    ]
    rcpt_str = json.dumps(rcpt)
    while True:
        print_receipt(rcpt_str)
        time.sleep(10)

## Print Queue

import http.client
printq_base = 'hjfje6icwa.execute-api.us-west-2.amazonaws.com'

# A less efficient but more robust polling implementation that opens a new connection
# for every poll request

def printq_poll(queue):
    log_trace(1, f'Polling print queue {printq_base}/{queue}/receipts')
    while True:
        try:
            connection = http.client.HTTPSConnection(printq_base)
            connection.request('GET', f'/{queue}/receipts')
            response = connection.getresponse()
            data = response.read().decode('utf-8')
            if response.status == 200:
                try:          
                    payload = json.loads(data)
                except Exception as e:
                    log_error(f'Bad payload from print queue: {e}')
                    log_error(data)
                    payload = {'receipts': []}
                if len(payload['receipts']) == 0:
                    log_trace(2, 'Print queue empty')
                    time.sleep(poll_interval())
                for msg in sorted(payload['receipts'], key=lambda x: x['receiptID']):
                    id = msg['receiptID']
                    log_trace(1, f'Receipt ID {id}')
                    rcpt = msg['content'].replace('%34', '"').replace('%09', '\\t')
                    print_receipt(rcpt)
                    printq_delete(queue, id)
            connection.close()
        except Exception as e:
            log_error(f'Exception while polling print queue: {e}')


def printq_delete(queue, id):
    try:
        connection = http.client.HTTPSConnection(printq_base)
        connection.request('DELETE', f'/{queue}/receipts?receiptID={id}')
        response = connection.getresponse()
        connection.close()
        if response.status != 200:
            log_error(f'DELETE {id} failed: {response.msg}')
    except Exception as e:
        log_error(f'Exception during deletion from queue: {e}')

def poll_interval():
    time_struct = time.localtime()
    # Mon-Sat 9am-1pm
    if args.interactive or time_struct[6] != 6 and 9 <= time_struct[3] <= 12:
        return 1
    else:
        return 20


## Utility Functions

def log_trace(level, msg):
    if args.verbosity >= level:
        print(time.ctime(), 'TRACE', msg, flush=True)

def log_error(msg):
    print(time.ctime(), 'ERROR', msg, flush=True)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('-f', '--file', 
        help='file to receive printer commands')
    parser.add_argument('-i', '--interactive', action='store_true', 
        help='display receipts on screen instead of printing')
    parser.add_argument('-p', '--printer', 
        help='IP address of Epson printer')
    parser.add_argument('-q', '--queue', 
        default='prod', choices=('prod', 'dev'), help='print queue to poll (dev or prod)')
    parser.add_argument('-t', '--test', action='store_true',
        help='print test receipt and exit')
    parser.add_argument('-v', '--verbosity', type=int,
        default=1, choices=range(0, 3), help='level of debug tracing')
    args = parser.parse_args()

    if not args.interactive:
        # Redirect output to log file
        sys.stdout = open('printlog_' + 
            time.strftime('%Y%m%d', time.localtime()) + '.txt', 'a')
        sys.stderr = sys.stdout

    log_trace(1, 'Print server start')
    try:
        if args.test:
            prn_test_receipt()
        else:
            printq_poll(args.queue)
    except KeyboardInterrupt:
        pass
    log_trace(1, 'Print server exit')
    sys.exit(0)
