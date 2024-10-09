import io from 'socket.io-client';


const SOCKET_URL = 'http://54.243.69.253:3000/';

// class WSService {
//     constructor() {
//         this.isConnecting = false; // To avoid multiple connection attempts
//         this.socket = null;
//         this.connectedCallbacks = [];
//     }

//     // Initialize socket
//     initialize = () => {
//         if (!this.socket) {
//             this.isConnecting = true;
//             try {
//                 this.socket = io(SOCKET_URL, {
//                     transports: ['websocket'],
//                 });

//                 // Listen for connection success
//                 this.socket.on('connect', () => {
//                     console.log('Socket connected', this.socket.id);
//                     this.isConnecting = false;
//                     this.connectedCallbacks.forEach((callback) => callback());
//                     this.connectedCallbacks = [];
//                 });

//                 // Handle connection error
//                 this.socket.on('error', (error) => {
//                     console.error('Socket connection error:', error);
//                 });

//                 this.socket.on('disconnect', (reason) => {
//                     console.log('Socket disconnected:', reason);
//                 });

//             } catch (error) {
//                 console.error('Socket initialization failed:', error);
//                 this.isConnecting = false;
//             }
//         }
//     };

//     // Emit event, but only if connected
//     emit(event, data = {}) {
//         if (this.socket && this.socket.connected) {
//             console.log('Socket connected, emitting event:', event);
//             this.socket.emit(event, data);
//         } else {
//             console.log('Socket is not connected yet, queuing event:', event);
//             this.connectedCallbacks.push(() => {
//                 this.socket.emit(event, data);
//             });
//         }
//     }

//     // Listen to event
//     on(event, callback) {
//         if (this.socket) {
//             this.socket.on(event, callback);
//         }
//     }

//     // Remove listener
//     off(event, callback) {
//         if (this.socket) {
//             this.socket.off(event, callback);
//         }
//     }

//         // Check if socket is connected
//         get isConnected() {
//             return this.socket && this.socket.connected;
//         }

//     // Disconnect socket
//     disconnect() {
//         if (this.socket) {
//             this.socket.disconnect();
//         }
//     }
// }

class WSService {
    initializeSocket = async () => {
        try {
            this.socket = io(SOCKET_URL, {
                transport: ['websocket']
            })
            console.log("INITIALIZING SOCKET", this.socket);
            

            this.socket.on('connection', (data) => {
                console.log("SOCKET CONNECTED", data);
                
            })

            this.socket.on('disconnect', (data) => {
                console.log("SOCKET DISCONNECTED", data);
                
            })

            
            this.socket.on('error', (data) => {
                console.log("SOCKET ERROR", data);
                
            })

        } catch (error) {
           console.log("SOCKET IS NOT INITIALIZED", error);
           
        }
    }
    disconnectSocket = () => {
        if (this.socket) {
            this.socket.disconnect();
            console.log("SOCKET DISCONNECTED");
            
        }
    }

    emit(event, data = {}) {
        this.socket.emit(event, data);
    }

    on(event, callback) {
        this.socket.on(event, callback);
    }

    removeListener(listenerName) {
        this.socket.removeListener(listenerName);
    }

}

const socketService = new WSService();
export default socketService;



