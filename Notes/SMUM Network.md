# SMUM Network
We depend upon a few elements of the network configuration at Santa Maria.
These notes summarize important settings.

## IP Addresses
The only dependency on a fixed IP address is that of the receipt printer, which is `192.168.1.3`.
If this address changes, then the print server process, which normally runs on the front desk PC, needs to be updated with the new address.

## Router Configuration
The router provides a web interface for configuration. The admin username and password are currently `cusadmin` and `highspeed`.
However, there is a limited number of logins allowed before the password must be changed. When that happens, *please* update this document.

The router settings may revert after power failure to provide network addresses of `10.1.10.x`. If so, change the settings as follows and 
restart the router. 
- Router address `192.168.1.1`
- Subnet mask `255.255.255.0`
- DHCP range `192.168.1.2` through `192.168.1.253`
- Reserved IP address `192.168.1.3` for the receipt printer (MAC address `F8-D0-27-A6-A1-9A`)

The wifi network must also be restarted by power cycling the small device with a power cord on one end and two ethernet
ports on the other.