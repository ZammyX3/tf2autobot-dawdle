import ReconnectingWebSocket from 'reconnecting-websocket';
import log from '../../../lib/logger';
import WS from 'ws';
import * as Events from 'reconnecting-websocket/events';
import { exponentialBackoff } from '../../helpers';

export default class PricesTfSocketManager {
    private readonly socketClass;

    constructor() {
        // No headers needed for Pricedb.io
        this.socketClass = class WebSocket extends WS {
            constructor(url: string, protocols: string | string[]) {
                super(url, protocols);
            }
        };
    }

    private ws: ReconnectingWebSocket;

    private socketDisconnected(): () => void {
        return () => {
            log.debug('Disconnected from socket server');
        };
    }

    private socketConnect(): () => void {
        return () => {
            log.debug('Connected to socket server');
        };
    }

    init(): void {
        this.shutDown();
        this.ws = new ReconnectingWebSocket('wss://ws.pricedb.io', [], {
            WebSocket: this.socketClass,
            maxEnqueuedMessages: 0,
            startClosed: true
        });

        this.ws.addEventListener('open', this.socketConnect());
        this.ws.addEventListener('error', err => {
            log.error('Websocket error', err?.error);
        });
        this.ws.addEventListener('close', this.socketDisconnected());

        // Optional: handle incoming messages
        this.ws.addEventListener('message', event => {
            log.debug('Received message from Pricedb.io:', event.data);
        });
    }

    get isConnecting(): boolean {
        return this.ws.readyState === WS.CONNECTING;
    }

    connect(): void {
        this.ws.reconnect();
    }

    shutDown(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = undefined;
        }
    }

    send(data: string): void {
        this.ws.send(data);
    }

    on<T extends keyof Events.WebSocketEventListenerMap>(name: T, handler: Events.WebSocketEventListenerMap[T]): void {
        this.ws.addEventListener(name, handler);
    }
}
