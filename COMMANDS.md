# Complete Command List for SDN QoS Terminal Simulator

## Regular Shell Commands (mininet@mininet-vm:~$)

### 1. Help
```
help
```
Shows all available commands

### 2. Install Dependencies
```
sudo apt install python3-ryu openvswitch-switch iperf
```
Installs Ryu, Open vSwitch, and iperf packages

### 3. View Controller Code
```
cat qos_controller.py
```
Displays the Ryu QoS controller Python code

### 4. Configure Open vSwitch QoS
```
sudo ovs-vsctl -- set port s1-eth1 qos=@newqos -- --id=@newqos create qos type=linux-htb other-config:max-rate=100000000 \ queues:0=@q0 queues:1=@q1 -- --id=@q0 create queue other-config:min-rate=30000000 other-config:max-rate=60000000 \ --id=@q1 create queue other-config:min-rate=10000000 other-config:max-rate=20000000
```
Configures QoS queues on switch port s1-eth1

### 5. Start Ryu Controller
```
ryu-manager qos_controller.py
```
Starts the Ryu SDN controller

### 6. Create Mininet Topology
```
sudo mn --topo single,3 --mac --switch ovsk --controller=remote
```
Creates a network with 3 hosts connected to 1 switch (enters Mininet mode)

### 7. Clear Terminal
```
clear
```
Clears the terminal output

### 8. Exit Terminal
```
exit
```
Exits the terminal

---

## Mininet Commands (mininet>)

*Note: These commands only work after entering Mininet mode with `sudo mn --topo single,3 --mac --switch ovsk --controller=remote`*

### 1. Help (Mininet)
```
help
```
Shows Mininet-specific commands

### 2. Test Connectivity
```
pingall
```
Tests ping connectivity between all hosts (h1, h2, h3)

### 3. Start TCP Server on h1 (Background)
```
h1 iperf -s &
```
Starts iperf TCP server on host 1 in background

### 4. Start TCP Server on h1 (Foreground)
```
h1 iperf -s
```
Starts iperf TCP server on host 1 (foreground, shows connection results)

### 5. Start UDP Server on h1 (Background)
```
h1 iperf -s -u &
```
Starts iperf UDP server on host 1 in background

### 6. UDP Client Test (10 Mbps) - Foreground
```
h2 iperf -c h1 -u -b 10M
```
Runs UDP client from h2 to h1 at 10 Mbps, shows results immediately

### 7. UDP Client Test (10 Mbps) - Background
```
h2 iperf -c h1 -u -b 10M &
```
Runs UDP client from h2 to h1 at 10 Mbps in background

### 8. UDP Client Test (60 Mbps) - Shows QoS Enforcement
```
h2 iperf -c h1 -u -b 60M &
```
Runs UDP client requesting 60 Mbps, but capped at ~10 Mbps by QoS configuration

### 9. TCP Client Test (Foreground)
```
h3 iperf -c h1
```
Runs TCP client from h3 to h1, shows bandwidth results

### 10. TCP Client Test (Background)
```
h3 iperf -c h1 &
```
Runs TCP client from h3 to h1 in background

### 11. Exit Mininet
```
exit
```
Exits Mininet and returns to regular shell prompt

---

## Suggested Demo Sequence

Here's the recommended order to demonstrate your SDN QoS project:

1. `help`
2. `sudo apt install python3-ryu openvswitch-switch iperf`
3. `cat qos_controller.py`
4. `ryu-manager qos_controller.py`
5. `sudo mn --topo single,3 --mac --switch ovsk --controller=remote`
6. `pingall`
7. `h1 iperf -s &`
8. `h3 iperf -c h1`
9. `h1 iperf -s -u &`
10. `h2 iperf -c h1 -u -b 10M`
11. `h2 iperf -c h1 -u -b 60M &` (demonstrates QoS capping)
12. `exit`

---

## Notes

- All commands match the exact outputs from your screenshots
- The terminal automatically switches to `mininet>` mode after creating the topology
- Use `&` at the end of commands to run them in the background
- Commands are case-sensitive
- Type `help` at any time to see available commands for the current mode

