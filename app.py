import random
import math
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Info(BaseModel):
    monsterIndex:int
    health:int
    xp:int
    currentWeapon:str
    monsterHealth:int
    gold:int

weapons = [{"name":"Stick","power":5},
           {"name":"Dagger","power":30},
           {"name":"Claw Hammer","power":50},
           {"name":"Sword","power":100}]

monsters = [{"name":"Slime","level":2,"health":15},
            {"name":"Fanged beast","level":8,"health":60},
            {"name":"Dragon","level":20,"health":300}]

@app.post("/attack",status_code=status.HTTP_200_OK)
async def attack(user:Info):
    message=""
    if(user.health<20 or random.random()>0.2):
        user.monsterHealth -= weapons[next((i for i, item in enumerate(weapons) if item["name"] == user.currentWeapon), -1)]["power"]+ math.floor(random.random()*user.xp)+1
        message= f"The {monsters[user.monsterIndex]["name"]} attacks. You attack it with your {user.currentWeapon}"
    else:
        message="You Miss"
    hit = monsters[user.monsterIndex]["level"]*5 - math.floor(random.random()*user.xp)
    if hit>0:
        user.health-=hit
        if user.health<=0:
            message = "You Died :("
            return {"gameOver":True,"message":message}
    if user.monsterHealth <=0:
        user.monsterHealth=0
        if monsters[user.monsterIndex]["name"]=="Dragon":
            game_over = True
            message = "You have slain the dragon!<br />You Win"
            return {"gameOver":game_over,"message":message}
        else:
            message = "You have killed the monster.<br />You have gained xp and gold.<br />You have been brought back to the town square."
            user.gold += math.floor(monsters[user.monsterIndex]["level"]*6.7)
            user.xp += monsters[user.monsterIndex]["level"]
            return {"health":user.health,"gold":user.gold,"xp":user.xp,"message":message,"monsterHealth":user.monsterHealth,"loc":"TownSquare","monsterKilled":True}
    response_data = {
        "health":user.health,
        "monsterHealth":user.monsterHealth
    }
    if message:
        response_data["message"] = message
    return response_data