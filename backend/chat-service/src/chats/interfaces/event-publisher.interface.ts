// AI-generated: IEventPublisher interface decoupling real-time notifications from Redis
export interface IEventPublisher {
  publish(triggerName: string, payload: any): Promise<void>;
  asyncIterator<T>(triggerName: string): AsyncIterator<T>;
}
