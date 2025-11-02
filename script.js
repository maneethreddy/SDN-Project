let terminal;
let commandInput;
let commandHistory = [];

// Command outputs based on screenshots
const commandOutputs = {
    'help': `Available Commands:
  sudo apt install python3-ryu openvswitch-switch iperf  - Install dependencies
  sudo ovs-vsctl ...                                        - Configure Open vSwitch QoS
  cat qos_controller.py                                     - View Ryu controller code
  ryu-manager qos_controller.py                            - Start Ryu controller
  sudo mn --topo single,3 --mac --switch ovsk --controller=remote  - Create topology
  mininet> pingall                                          - Test connectivity
  mininet> h1 iperf -s &                                    - Start TCP server on h1
  mininet> h2 iperf -c h1 -u -b 10M                        - UDP client test
  mininet> h3 iperf -c h1                                   - TCP client test
  exit                                                      - Exit terminal
  clear                                                     - Clear terminal`,

    'sudo apt install python3-ryu openvswitch-switch iperf': `Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
iperf is already the newest version (2.0.13+dfsg1-1build1).
python3-ryu is already the newest version (4.30+ds1-2).
The following additional packages will be installed:
  openvswitch-common openvswitch-pki openvswitch-testcontroller python3-openvswitch
Suggested packages:
  openvswitch-doc
The following packages will be upgraded:
  openvswitch-common openvswitch-pki openvswitch-testcontroller python3-openvswitch
5 upgraded, 0 newly installed, 0 to remove, 387 not upgraded.
Need to get 3,507 kB of archives.
After this operation, 82.9 kB of additional disk space will be used.
Do you want to continue? [Y/n] y
Get:1 http://us.archive.ubuntu.com/ubuntu focal-updates/universe amd64 openvswitch-testcontroller amd64 2.13.8-0ubuntu1.4 [703 kB]
Get:2 http://us.archive.ubuntu.com/ubuntu focal-updates/universe amd64 openvswitch-pki all 2.13.8-0ubuntu1.4 [13.3 kB]
Get:3 http://us.archive.ubuntu.com/ubuntu focal-updates/main amd64 python3-openvswitch all 2.13.8-0ubuntu1.4 [94.9 kB]
Get:4 http://us.archive.ubuntu.com/ubuntu focal-updates/main amd64 openvswitch-common amd64 2.13.8-0ubuntu1.4 [1,156 kB]
Get:5 http://us.archive.ubuntu.com/ubuntu focal-updates/main amd64 openvswitch-switch amd64 2.13.8-0ubuntu1.4 [1,539 kB]
Fetched 3,507 kB in 41s (84.6 kB/s)
(Reading database ... 118005 files and directories currently installed.)
Preparing to unpack .../openvswitch-testcontroller_2.13.8-0ubuntu1.4_amd64.deb ...
Unpacking openvswitch-testcontroller (2.13.8-0ubuntu1.4) over (2.13.7-0ubuntu0.20.04.4) ...
Setting up openvswitch-testcontroller (2.13.8-0ubuntu1.4) ...
Processing triggers for man-db (2.9.1-1) ...`,

    'sudo ovs-vsctl -- set port s1-eth1 qos=@newqos -- \\\n--id=@newqos create qos type=linux-htb other-config:max-rate=100000000 \\\nqueues:0=@q0 queues:1=@q1 -- \\\n--id=@q0 create queue other-config:min-rate=30000000 other-config:max-rate=60000000 -- \\\n--id=@q1 create queue other-config:min-rate=10000000 other-config:max-rate=20000000': `85dab88d-db76-495f-a4ac-46d87dce2a09
a6e32db8-beb9-4993-ae10-ee729d47ea36
07742deb-3b21-47f6-a495-ff586f51d9e8`,

    'cat qos_controller.py': `from ryu.base import app_manager
from ryu.controller import ofp_event
from ryu.controller.handler import CONFIG_DISPATCHER, MAIN_DISPATCHER
from ryu.controller.handler import set_ev_cls
from ryu.ofproto import ofproto_v1_3

class QoSController(app_manager.RyuApp):
    OFP_VERSIONS = [ofproto_v1_3.OFP_VERSION]

    def __init__(self, *args, **kwargs):
        super(QoSController, self).__init__(*args, **kwargs)

    @set_ev_cls(ofp_event.EventOFPSwitchFeatures, CONFIG_DISPATCHER)
    def switch_features_handler(self, ev):
        datapath = ev.msg.datapath
        ofproto = datapath.ofproto
        parser = datapath.ofproto_parser

        # PRIORITY FLOW: All UDP traffic (simulate VoIP/Video) -> High queue (queue_id=1)
        match_udp = parser.OFPMatch(eth_type=0x0800, ip_proto=17)
        actions = [parser.OFPActionSetQueue(1), parser.OFPActionOutput(ofproto.OFPP_FLOOD)]
        inst = [parser.OFPInstructionActions(ofproto.OFPIT_APPLY_ACTIONS, actions)]
        mod_udp = parser.OFPFlowMod(datapath=datapath, priority=2, match=match_udp, instructions=inst)
        datapath.send_msg(mod_udp)

        # BULK FLOW: All TCP traffic -> Normal queue (queue_id=0)
        match_tcp = parser.OFPMatch(eth_type=0x0800, ip_proto=6)
        actions = [parser.OFPActionSetQueue(0), parser.OFPActionOutput(ofproto.OFPP_FLOOD)]
        inst = [parser.OFPInstructionActions(ofproto.OFPIT_APPLY_ACTIONS, actions)]
        mod_tcp = parser.OFPFlowMod(datapath=datapath, priority=1, match=match_tcp, instructions=inst)
        datapath.send_msg(mod_tcp)

        # Default: all else (just flood as backup)
        match = parser.OFPMatch()
        actions = [parser.OFPActionOutput(ofproto.OFPP_FLOOD)]
        inst = [parser.OFPInstructionActions(ofproto.OFPIT_APPLY_ACTIONS, actions)]
        mod = parser.OFPFlowMod(datapath=datapath, priority=0, match=match, instructions=inst)
        datapath.send_msg(mod)`,

    'ryu-manager qos_controller.py': `loading app qos_controller.py
loading app ryu.controller.ofp_handler
instantiating app qos_controller.py of QoSController
instantiating app ryu.controller.ofp_handler of OFPHandler`,

    'sudo mn --topo single,3 --mac --switch ovsk --controller=remote': `*** Creating network
*** Adding controller
Unable to contact the remote controller at 127.0.0.1:6653
Unable to contact the remote controller at 127.0.0.1:6653
Unable to contact the remote controller at 127.0.0.1:6633
Setting remote controller to 127.0.0.1:6653
*** Adding hosts: h1 h2 h3
*** Adding switches: s1
*** Adding links: (h1, s1) (h2, s1) (h3, s1)
*** Configuring hosts h1 h2 h3
*** Starting controller c0
*** Starting 1 switches s1 ...
*** Starting CLI:
mininet>`,

    'mininet> pingall': `*** Ping: testing ping reachability
h1 -> h2 h3 
h2 -> h1 h3 
h3 -> h1 h2 
*** Results: 0% dropped (6/6 received)
mininet>`,

    'mininet> h1 iperf -s &': `[1] 12345
Server listening on TCP port 5001
TCP window size: 85.3 KByte (default)
mininet>`,

    'mininet> h1 iperf -s': `Server listening on TCP port 5001
TCP window size: 85.3 KByte (default)
[  4] local 10.0.0.1 port 5001 connected with 10.0.0.3 port 36154
[ ID] Interval       Transfer     Bandwidth
[  4]  0.0-12.3 sec  81.5 MBytes  55.8 Mbits/sec
mininet>`,

    'mininet> h3 iperf -c h1': `--------------------------------------------------------------------
Client connecting to 10.0.0.1, TCP port 5001
TCP window size: 187 KByte (default)
--------------------------------------------------------------------
[  3] local 10.0.0.3 port 36156 connected with 10.0.0.1 port 5001
[ ID] Interval       Transfer     Bandwidth
[  3]  0.0-10.4 sec  79.5 MBytes  63.8 Mbits/sec
mininet>`,

    'mininet> h1 iperf -s -u &': `[2] 12346
--------------------------------------------------------------------
Server listening on TCP port 5001
TCP window size: 85.3 KByte (default)
--------------------------------------------------------------------
mininet>`,

    'mininet> h2 iperf -c h1 -u -b 10M': `Client connecting to 10.0.0.1, UDP port 5001
Sending 1470 byte datagrams, IPG target: 1121.52 us (kalman adjust)
UDP buffer size: 208 KByte (default)
--------------------------------------------------------------------
[  3] local 10.0.0.2 port 42668 connected with 10.0.0.1 port 5001
[ ID] Interval       Transfer     Bandwidth
[  3]  0.0-10.0 sec  12.5 MBytes  10.5 Mbits/sec
[  3] Sent 8917 datagrams
[  3] Server Report:
[  3]  0.0-10.0 sec  12.5 MBytes  10.5 Mbits/sec  0.005 ms  0/ 8917 (0%)
mininet>`,

    'mininet> h3 iperf -c h1': `Client connecting to 10.0.0.1, TCP port 5001
TCP window size: 187 KByte (default)
[  3] local 10.0.0.3 port 36156 connected with 10.0.0.1 port 5001
[ ID] Interval       Transfer     Bandwidth
[  3]  0.0-10.4 sec  79.5 MBytes  63.8 Mbits/sec
mininet>`,

    'mininet> h2 iperf -c h1 -u -b 10M &': `[3] 12348
Client connecting to 10.0.0.1, UDP port 5001
Sending 1470 byte datagrams, IPG target: 1121.52 us (kalman adjust)
UDP buffer size: 208 KByte (default)
--------------------------------------------------------------------
[  3] local 10.0.0.2 port 60048 connected with 10.0.0.1 port 5001
[ ID] Interval       Transfer     Bandwidth
[  3]  0.0-10.0 sec  12.5 MBytes  10.5 Mbits/sec
[  3] Sent 8917 datagrams
[  3] Server Report:
[  3]  0.0-10.0 sec  12.5 MBytes  10.5 Mbits/sec  0.061 ms  0/ 8917 (0%)
mininet>`,

    'mininet> h3 iperf -c h1 &': `[4] 12349
--------------------------------------------------------------------
Client connecting to 10.0.0.1, TCP port 5001
TCP window size: 187 KByte (default)
--------------------------------------------------------------------
[  3] local 10.0.0.3 port 36160 connected with 10.0.0.1 port 5001
[ ID] Interval       Transfer     Bandwidth
[  3]  0.0-10.2 sec  78.9 MBytes  64.7 Mbits/sec
mininet>`,

    'mininet> h2 iperf -c h1 -u -b 60M &': `Trying to send more traffic through udp but still it will do only 10mbps/sec as configured in the open vswitch queue configuration thus guaranteeing minimum quality of service(QoS):

[5] 12350
Client connecting to 10.0.0.1, UDP port 5001
Sending 1470 byte datagrams, IPG target: 1121.52 us (kalman adjust)
UDP buffer size: 208 KByte (default)
--------------------------------------------------------------------
[  3] local 10.0.0.2 port 44671 connected with 10.0.0.1 port 5001
[ ID] Interval       Transfer     Bandwidth
[  3]  0.0-10.0 sec  12.5 MBytes  10.5 Mbits/sec
[  3] Sent 8917 datagrams
[  3] Server Report:
[  3]  0.0-10.0 sec  12.5 MBytes  10.5 Mbits/sec  0.333 ms  0/ 8917 (0%)
mininet>`,

    'clear': '',
    'exit': 'Exiting...'
};

let isMininetMode = false;
let mininetCommands = {};

// Initialize mininet commands
function initMininetCommands() {
    mininetCommands = {
        'pingall': commandOutputs['mininet> pingall'],
        'h1 iperf -s &': commandOutputs['mininet> h1 iperf -s &'],
        'h1 iperf -s': commandOutputs['mininet> h1 iperf -s'],
        'h1 iperf -s -u &': commandOutputs['mininet> h1 iperf -s -u &'],
        'h2 iperf -c h1 -u -b 10M': commandOutputs['mininet> h2 iperf -c h1 -u -b 10M'],
        'h2 iperf -c h1 -u -b 10M &': commandOutputs['mininet> h2 iperf -c h1 -u -b 10M &'],
        'h2 iperf -c h1 -u -b 60M &': commandOutputs['mininet> h2 iperf -c h1 -u -b 60M &'],
        'h3 iperf -c h1': commandOutputs['mininet> h3 iperf -c h1'],
        'h3 iperf -c h1 &': commandOutputs['mininet> h3 iperf -c h1 &'],
        'exit': `*** Stopping 1 switches
*** Stopping 3 hosts
*** Stopping controller
*** Done
mininet@mininet-vm:~$`,
        'help': `Mininet Commands:
  pingall              - Test connectivity between all hosts
  h1 iperf -s &        - Start TCP server on h1 (background)
  h1 iperf -s -u &     - Start UDP server on h1 (background)
  h2 iperf -c h1 -u -b 10M    - UDP client from h2 to h1 at 10 Mbps
  h2 iperf -c h1 -u -b 60M &  - UDP client at 60 Mbps (capped by QoS)
  h3 iperf -c h1       - TCP client from h3 to h1
  exit                 - Exit Mininet and return to shell`
    };
}

initMininetCommands();

function addOutput(text, className = 'output', animate = true) {
    if (!terminal) return;
    const outputDiv = document.createElement('div');
    outputDiv.className = className;
    terminal.appendChild(outputDiv);
    
    if (animate && text.trim()) {
        // Type out the text character by character
        let index = 0;
        const typeInterval = setInterval(() => {
            if (index < text.length) {
                outputDiv.textContent = text.substring(0, index + 1);
                terminal.scrollTop = terminal.scrollHeight;
                index++;
            } else {
                clearInterval(typeInterval);
            }
        }, 10); // Adjust speed: lower = faster, higher = slower
    } else {
        outputDiv.textContent = text;
        terminal.scrollTop = terminal.scrollHeight;
    }
}

function addPrompt(command = '') {
    if (!terminal) return;
    
    // Remove existing input line
    const oldInputLine = document.getElementById('inputLine');
    if (oldInputLine && oldInputLine.parentNode) {
        oldInputLine.remove();
    }
    
    const promptDiv = document.createElement('div');
    promptDiv.className = 'prompt-line';
    const promptSpan = document.createElement('span');
    promptSpan.className = isMininetMode ? 'mininet-prompt' : 'prompt';
    promptSpan.textContent = isMininetMode ? 'mininet>' : 'mininet@mininet-vm:~$';
    
    if (command) {
        // Just show the prompt with command (for executed commands)
        const commandSpan = document.createElement('span');
        commandSpan.className = 'command';
        commandSpan.textContent = ' ' + command;
        promptDiv.appendChild(promptSpan);
        promptDiv.appendChild(commandSpan);
        terminal.appendChild(promptDiv);
    } else {
        // Create new input line inline with prompt
        promptDiv.appendChild(promptSpan);
        
        // Create input element inline
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'terminal-input';
        input.id = 'commandInput';
        input.autocomplete = 'off';
        input.spellcheck = false;
        input.value = '';
        
        // Create cursor
        const cursor = document.createElement('span');
        cursor.className = 'cursor';
        cursor.id = 'inputCursor';
        cursor.textContent = '█';
        
        promptDiv.appendChild(input);
        promptDiv.appendChild(cursor);
        promptDiv.id = 'inputLine';
        
        terminal.appendChild(promptDiv);
        
        // Reattach handlers
        commandInput = attachInputHandlers(input);
        updateInputPrompt();
        
        // Focus input
        setTimeout(() => {
            if (commandInput) {
                commandInput.focus();
            }
        }, 10);
    }
    
    terminal.scrollTop = terminal.scrollHeight;
}

function updateInputPrompt() {
    const inputPrompt = document.getElementById('inputPrompt');
    if (inputPrompt) {
        inputPrompt.textContent = isMininetMode ? 'mininet>' : 'mininet@mininet-vm:~$';
    }
}

function executeCommand(command) {
    if (!terminal || !commandInput) {
        console.error('executeCommand: terminal or input not available');
        return;
    }
    console.log('executeCommand called with:', command);
    
    command = command.trim();
    if (!command) return;

    commandHistory.push(command);
    
    // Add command prompt (no animation for prompt)
    addPrompt(command);
    
    // Small delay before showing output to make it feel natural
    setTimeout(() => {
        // Handle clear
        if (command === 'clear') {
            // Clear all except the welcome message and input line
            const welcomeMsg = terminal.querySelector('.welcome-message');
            terminal.innerHTML = '';
            if (welcomeMsg) {
                terminal.appendChild(welcomeMsg);
            }
            setTimeout(() => {
                addPrompt();
            }, 50);
            return;
        }

        // Handle exit
        if (command === 'exit' && isMininetMode) {
            isMininetMode = false;
            updateInputPrompt();
            addOutput(commandOutputs['exit'], 'output', true);
            // Calculate delay based on output length for animation
            const exitOutput = commandOutputs['exit'];
            const animationTime = exitOutput.length * 10 + 500;
            setTimeout(() => {
                addPrompt();
            }, animationTime);
            return;
        }

        if (command === 'exit') {
            addOutput('Exiting terminal...', 'output', true);
            return;
        }

    // Check if we're in mininet mode
    if (isMininetMode) {
        let output = mininetCommands[command];
        
        // Handle variations of commands
        if (!output && command.startsWith('h1 iperf -s')) {
            if (command.includes('-u')) {
                output = commandOutputs['mininet> h1 iperf -s -u &'];
            } else if (command.endsWith('&')) {
                output = commandOutputs['mininet> h1 iperf -s &'];
            } else {
                output = commandOutputs['mininet> h1 iperf -s'];
            }
        }
        
        if (!output && command.startsWith('h2 iperf -c h1')) {
            if (command.includes('-b 60M')) {
                output = commandOutputs['mininet> h2 iperf -c h1 -u -b 60M &'];
            } else if (command.includes('-b 10M')) {
                output = commandOutputs[command.endsWith('&') ? 'mininet> h2 iperf -c h1 -u -b 10M &' : 'mininet> h2 iperf -c h1 -u -b 10M'];
            }
        }
        
        if (!output && command.startsWith('h3 iperf -c h1')) {
            output = commandOutputs[command.endsWith('&') ? 'mininet> h3 iperf -c h1 &' : 'mininet> h3 iperf -c h1'];
        }
        
        if (!output) {
            output = mininetCommands[command] || `Command not found: ${command}\nType 'help' for available commands.`;
        }
        
        addOutput(output, 'output', true);
        // Calculate delay based on output length for animation completion
        const animationTime = output.length * 10 + 200;
        setTimeout(() => {
            addPrompt();
        }, animationTime);
        return;
    }

    // Handle regular commands
    let output = commandOutputs[command];
    
    // Handle partial matches for ovs-vsctl
    if (!output && command.includes('ovs-vsctl')) {
        // Try to match the multi-line format or single-line format
        if (command.includes('qos=@newqos')) {
            output = commandOutputs['sudo ovs-vsctl -- set port s1-eth1 qos=@newqos -- \\\n--id=@newqos create qos type=linux-htb other-config:max-rate=100000000 \\\nqueues:0=@q0 queues:1=@q1 -- \\\n--id=@q0 create queue other-config:min-rate=30000000 other-config:max-rate=60000000 -- \\\n--id=@q1 create queue other-config:min-rate=10000000 other-config:max-rate=20000000'];
        }
    }

    // Handle sudo mn command
    if (command.includes('sudo mn') && command.includes('--topo single,3')) {
        output = commandOutputs['sudo mn --topo single,3 --mac --switch ovsk --controller=remote'];
        isMininetMode = true;
        updateInputPrompt();
    }

    // Handle ryu-manager
    if (command.includes('ryu-manager')) {
        output = commandOutputs['ryu-manager qos_controller.py'];
    }

    // Handle apt install
    if (command.includes('apt install') && command.includes('ryu')) {
        output = commandOutputs['sudo apt install python3-ryu openvswitch-switch iperf'];
    }

        if (output) {
            addOutput(output, 'output', true); // Animate the output
            // Calculate delay based on output length for animation completion
            const animationTime = output.length * 10 + 200;
            setTimeout(() => {
                addPrompt();
            }, animationTime);
        } else {
            const errorMsg = `Command not found: ${command}`;
            const helpMsg = 'Type "help" for available commands.';
            addOutput(errorMsg, 'output error', true);
            // Wait for first message to finish, then show second
            const firstAnimationTime = errorMsg.length * 10 + 200;
            setTimeout(() => {
                addOutput(helpMsg, 'output info', true);
                const totalTime = firstAnimationTime + (helpMsg.length * 10) + 200;
                setTimeout(() => {
                    addPrompt();
                }, totalTime - firstAnimationTime);
            }, firstAnimationTime);
        }
    }, 100); // Initial delay before starting output
}

// Global flag for initialization
let isInitializing = true;

// Make executeCommand globally accessible for debugging
window.executeTerminalCommand = function(cmd) {
    if (terminal && commandInput) {
        executeCommand(cmd);
    } else {
        console.error('Terminal not initialized!');
    }
};

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    terminal = document.getElementById('terminal');
    commandInput = document.getElementById('commandInput');
    const inputLine = document.getElementById('inputLine');
    
    console.log('DOM loaded, terminal:', terminal, 'input:', commandInput);
    
    if (!terminal || !commandInput || !inputLine) {
        console.error('Terminal elements not found');
        alert('Error: Terminal elements not found! Check console.');
        return;
    }
    
    let historyIndex = -1;
    
    // Function to attach event handlers to input
    function attachInputHandlers(inputEl) {
        if (!inputEl) return null;
        
        function handleEnterKey(e) {
            if (e.key === 'Enter' || e.keyCode === 13) {
                e.preventDefault();
                e.stopPropagation();
                
                const cmd = inputEl.value.trim();
                
                if (cmd) {
                    try {
                        executeCommand(cmd);
                        inputEl.value = '';
                        historyIndex = -1;
                    } catch (error) {
                        console.error('Error executing command:', error);
                        alert('Error: ' + error.message);
                    }
                }
                return false;
            } 
            
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (commandHistory.length > 0) {
                    if (historyIndex < commandHistory.length - 1) {
                        historyIndex++;
                        inputEl.value = commandHistory[commandHistory.length - 1 - historyIndex];
                    }
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (historyIndex > 0) {
                    historyIndex--;
                    inputEl.value = commandHistory[commandHistory.length - 1 - historyIndex];
                } else {
                    historyIndex = -1;
                    inputEl.value = '';
                }
            }
        }
        
        inputEl.addEventListener('keydown', handleEnterKey, false);
        inputEl.onkeydown = handleEnterKey;
        
        return inputEl;
    }
    
    // Attach handlers to initial input
    commandInput = attachInputHandlers(commandInput);
    
    // Click handler for focus
    terminal.addEventListener('click', (e) => {
        if (commandInput && e.target !== commandInput) {
            commandInput.focus();
        }
    });
    
    commandInput.setAttribute('tabindex', '0');
    
    // Immediately enable input
    isInitializing = false;
    commandInput.disabled = false;
    commandInput.focus();
    
    console.log('✅ Terminal initialized. Input ready.');
    
    // Add welcome message and pre-run initial commands
    setTimeout(() => {
        console.log('Starting initialization sequence...');
        addOutput('\n=== SDN QoS Project Terminal Simulator ===', 'output info', false);
        addOutput('This terminal simulates Mininet commands for demonstrating QoS (Quality of Service) implementation.', 'output', false);
        addOutput('', 'output', false);
        
        // Pre-run command 1: Install packages
        setTimeout(() => {
            console.log('Running pre-built command 1: apt install');
            addPrompt('sudo apt install python3-ryu openvswitch-switch iperf');
            setTimeout(() => {
                const installOutput = commandOutputs['sudo apt install python3-ryu openvswitch-switch iperf'];
                addOutput(installOutput, 'output', true);
                const installTime = installOutput.length * 10 + 500;
                
                // Pre-run command 2: Create QoS queues
                setTimeout(() => {
                    console.log('Running pre-built command 2: ovs-vsctl');
                    // Display multi-line command properly with continuation prompts
                    const qosCommand = 'sudo ovs-vsctl -- set port s1-eth1 qos=@newqos -- \\';
                    const qosCommandLine2 = '--id=@newqos create qos type=linux-htb other-config:max-rate=100000000 \\';
                    const qosCommandLine3 = 'queues:0=@q0 queues:1=@q1 -- \\';
                    const qosCommandLine4 = '--id=@q0 create queue other-config:min-rate=30000000 other-config:max-rate=60000000 -- \\';
                    const qosCommandLine5 = '--id=@q1 create queue other-config:min-rate=10000000 other-config:max-rate=20000000';
                    
                    // Add first line with regular prompt
                    addPrompt(qosCommand);
                    setTimeout(() => {
                        // Add continuation lines with > prompt
                        const contPrompt1 = document.createElement('div');
                        contPrompt1.className = 'prompt-line';
                        contPrompt1.innerHTML = '<span class="prompt">&gt; </span><span class="command">' + qosCommandLine2 + '</span>';
                        terminal.appendChild(contPrompt1);
                        terminal.scrollTop = terminal.scrollHeight;
                        
                        setTimeout(() => {
                            const contPrompt2 = document.createElement('div');
                            contPrompt2.className = 'prompt-line';
                            contPrompt2.innerHTML = '<span class="prompt">&gt; </span><span class="command">' + qosCommandLine3 + '</span>';
                            terminal.appendChild(contPrompt2);
                            terminal.scrollTop = terminal.scrollHeight;
                            
                            setTimeout(() => {
                                const contPrompt3 = document.createElement('div');
                                contPrompt3.className = 'prompt-line';
                                contPrompt3.innerHTML = '<span class="prompt">&gt; </span><span class="command">' + qosCommandLine4 + '</span>';
                                terminal.appendChild(contPrompt3);
                                terminal.scrollTop = terminal.scrollHeight;
                                
                                setTimeout(() => {
                                    const contPrompt4 = document.createElement('div');
                                    contPrompt4.className = 'prompt-line';
                                    contPrompt4.innerHTML = '<span class="prompt">&gt; </span><span class="command">' + qosCommandLine5 + '</span>';
                                    terminal.appendChild(contPrompt4);
                                    terminal.scrollTop = terminal.scrollHeight;
                                    setTimeout(() => {
                                        const qosOutput = commandOutputs['sudo ovs-vsctl -- set port s1-eth1 qos=@newqos -- \\\n--id=@newqos create qos type=linux-htb other-config:max-rate=100000000 \\\nqueues:0=@q0 queues:1=@q1 -- \\\n--id=@q0 create queue other-config:min-rate=30000000 other-config:max-rate=60000000 -- \\\n--id=@q1 create queue other-config:min-rate=10000000 other-config:max-rate=20000000'];
                                        addOutput(qosOutput, 'output', true);
                                        const qosTime = qosOutput.length * 10 + 500;
                                        
                                        // Show ready message
                                        setTimeout(() => {
                                            addOutput('', 'output', false);
                                            addOutput('Setup complete! You can now run other commands.', 'output info', false);
                                            addPrompt();
                                            commandInput.focus();
                                            console.log('✅ Pre-built commands completed.');
                                        }, qosTime);
                                    }, 200);
                                }, 50);
                            }, 50);
                        }, 50);
                    }, 50);
                }, installTime);
            }, 200);
        }, 500);
    }, 300);
});
