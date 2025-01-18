from typing import Callable
from ..config.supabase_setup import supabase

class RealtimeManager:
    def __init__(self):
        self.supabase = supabase

    async def subscribe_to_group_bets(self, group_id: str, callback: Callable):
        return self.supabase\
            .table('bets')\
            .on('INSERT', lambda payload: callback(payload))\
            .eq('group_id', group_id)\
            .subscribe()

    async def subscribe_to_bet_updates(self, bet_id: str, callback: Callable):
        return self.supabase\
            .table('bet_contributions')\
            .on('INSERT', lambda payload: callback(payload))\
            .eq('bet_id', bet_id)\
            .subscribe()
