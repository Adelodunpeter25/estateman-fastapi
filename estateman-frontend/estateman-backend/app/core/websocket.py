from fastapi import WebSocket, WebSocketDisconnect
from typing import List, Dict, Any
import json
import asyncio
from datetime import datetime

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}
        self.room_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        """Connect a user's websocket"""
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: int):
        """Disconnect a user's websocket"""
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_personal_message(self, message: str, user_id: int):
        """Send message to specific user"""
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(message)
                except:
                    # Remove broken connections
                    self.active_connections[user_id].remove(connection)

    async def send_notification(self, notification_data: Dict[str, Any], user_id: int):
        """Send notification to specific user"""
        message = {
            "type": "notification",
            "data": notification_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.send_personal_message(json.dumps(message), user_id)

    async def broadcast_to_role(self, message: str, role: str):
        """Broadcast message to all users with specific role"""
        # This would need integration with user role checking
        for user_id, connections in self.active_connections.items():
            # Mock role check - would integrate with actual user service
            for connection in connections:
                try:
                    await connection.send_text(message)
                except:
                    pass

    async def join_room(self, websocket: WebSocket, room_id: str):
        """Join a room for group communications"""
        if room_id not in self.room_connections:
            self.room_connections[room_id] = []
        self.room_connections[room_id].append(websocket)

    async def leave_room(self, websocket: WebSocket, room_id: str):
        """Leave a room"""
        if room_id in self.room_connections:
            if websocket in self.room_connections[room_id]:
                self.room_connections[room_id].remove(websocket)
            if not self.room_connections[room_id]:
                del self.room_connections[room_id]

    async def broadcast_to_room(self, message: str, room_id: str):
        """Broadcast message to all users in a room"""
        if room_id in self.room_connections:
            for connection in self.room_connections[room_id]:
                try:
                    await connection.send_text(message)
                except:
                    self.room_connections[room_id].remove(connection)

# Global connection manager instance
manager = ConnectionManager()

class RealTimeNotificationService:
    def __init__(self):
        self.manager = manager

    async def send_achievement_notification(self, user_id: int, achievement_data: Dict[str, Any]):
        """Send real-time achievement notification"""
        notification = {
            "type": "achievement_earned",
            "title": "Achievement Unlocked!",
            "message": f"You earned: {achievement_data.get('name', 'New Achievement')}",
            "data": achievement_data
        }
        await self.manager.send_notification(notification, user_id)

    async def send_points_notification(self, user_id: int, points: int, description: str):
        """Send real-time points notification"""
        notification = {
            "type": "points_earned",
            "title": "Points Earned!",
            "message": f"+{points} points: {description}",
            "data": {"points": points, "description": description}
        }
        await self.manager.send_notification(notification, user_id)

    async def send_task_notification(self, user_id: int, task_data: Dict[str, Any]):
        """Send real-time task notification"""
        notification = {
            "type": "task_update",
            "title": "Task Update",
            "message": f"Task '{task_data.get('title', 'Unknown')}' has been updated",
            "data": task_data
        }
        await self.manager.send_notification(notification, user_id)

    async def send_payment_notification(self, user_id: int, payment_data: Dict[str, Any]):
        """Send real-time payment notification"""
        notification = {
            "type": "payment_reminder",
            "title": "Payment Reminder",
            "message": f"Payment of ${payment_data.get('amount', 0)} is due soon",
            "data": payment_data
        }
        await self.manager.send_notification(notification, user_id)

    async def send_event_notification(self, user_id: int, event_data: Dict[str, Any]):
        """Send real-time event notification"""
        notification = {
            "type": "event_reminder",
            "title": "Event Reminder",
            "message": f"Event '{event_data.get('title', 'Unknown')}' starts soon",
            "data": event_data
        }
        await self.manager.send_notification(notification, user_id)

# Global real-time service instance
realtime_service = RealTimeNotificationService()