import { useEffect, useState } from 'react'
import './App.css'
import api from './api'

function App() {
  const [xp,setXp] = useState(0)
  const [hp,setHp] = useState(100)
  const [gold,setGold] = useState(50)
  const [loc,setLoc] = useState("TownSquare")
  const [message,setMessage] = useState("Welcome to Dragon Repeller. You must defeat the dragon that is preventing people from leaving the town. You are in the town square. Where do you want to go? Use the buttons above.")
  const [button1,setButton1] = useState("Go to store")
  const [button2,setButton2] = useState("Go to cave")
  const [button3,setButton3] = useState("Fight dragon")

  const BuyHealth = () => {
    if(gold>=10){
      setGold(prev=>prev-10)
      setHp(prev=>prev+10)
    }else{
      setMessage("You do not have enough gold to buy health.")
    }
  }

  const weapons = [{"name":"Stick","power":5},
    {"name":"Dagger","power":30},
    {"name":"Claw Hammer","power":50},
    {"name":"Sword","power":100}]
  const [weaponInventory,setWeaponInventory] = useState(["Stick"])
  const [currentWeapon,setCurrentWeapon] = useState("Stick")

  const BuyWeapon = ()=> {
    if(currentWeapon==="Sword"){
      setMessage("You already have the best weapon")
      return
    }
    if(gold>=30){
      const currentIndex = weapons.findIndex(w => w.name === currentWeapon);
      const newWeapon = weapons[currentIndex + 1].name;
      setGold(prev=>prev-30)
      setCurrentWeapon(newWeapon)
      setWeaponInventory((prev) => {
        const updatedInventory = [...prev,newWeapon]
        setMessage(`You now have a ${newWeapon}.<br />Your inventory: ${updatedInventory.join(", ")}`)
        return updatedInventory
      })
    }else{
      setMessage("You do not have enough gold to buy a weapon.")
    }
  }

  const monsters = [{"name":"Slime","level":2,"health":15},
    {"name":"Fanged beast","level":8,"health":60},
    {"name":"Dragon","level":20,"health":300}]
  const [monsterHealth,setMonsterHealth] =useState(0)
  const [redDiv,setRedDiv] = useState("")
  const [monsterIndex,setMonsterIndex] = useState(-1)
  const [dodgeMessage,setDodgeMessage] = useState("")
  const [flag,setFlag] = useState(0)

  const Fight = (MonsterIndex:number) => {
    setLoc("Fight")
    if(flag!==1){setMessage("You are fighting a monster")}  
    setButton1("Attack")
    setButton2("Dodge")
    setButton3("Run")
    setMonsterIndex(MonsterIndex)
    if(monsterHealth===0){
      setRedDiv(`Monster Name: <strong>${monsters[MonsterIndex].name}</strong>&emsp;Health: <strong>${monsters[MonsterIndex].health}</strong>`)
      setMonsterHealth(monsters[MonsterIndex].health)
    }else{
      setRedDiv(`Monster Name: <strong>${monsters[MonsterIndex].name}</strong>&emsp;Health: <strong>${monsterHealth}</strong>`)
    }
  }

  const [gameOver,setGameOver] = useState(false)
  const [monsterKilled,setMonsterKilled] = useState(false)

  const Attack = async () => {
    setDodgeMessage("")
    try{
      const response = await api.post(`/attack?monsterIndex=${monsterIndex}`,{monsterIndex:monsterIndex,health:hp,xp:xp,currentWeapon:currentWeapon,monsterHealth:monsterHealth,gold:gold})
      if(response.status===200){
        setGold((prev)=>response.data.gold??prev)
        setXp((prev)=>response.data.xp??prev)
        setMonsterHealth((prev)=>response.data.monsterHealth??prev)
        setHp((prev)=>response.data.health??prev)
        setGameOver((prev)=>response.data.gameOver??prev)
        setLoc((prev)=>response.data.loc??prev)
        setMonsterKilled((prev)=>response.data.monsterKilled??prev)
        setFlag(1)
        setTimeout(()=>setMessage((prev)=>response.data.message??prev),0)
      }
      if(response.data.loc==="TownSquare"){
        ToTownSquare()
        setFlag(0)
      }
      if(response.data.gameOver===true){
        ToReset()
      }
    }catch(error:any){
      console.error(error)
    }
  }

  const ToReset = () => {
    setMonsterHealth(0)
    setLoc("Replay")
    setButton1("replay")
    setButton2("Replay")
    setButton3("REPLAY")
  }

  const Reset = () => {
    setXp(0)
    setHp(100)
    setGold(50)
    ToTownSquare()
    setCurrentWeapon("Stick")
    setWeaponInventory(["Stick"])
    setGameOver(false)
    setMonsterKilled(false)
  }

  useEffect(() => {
    if (flag === 1 && loc === "Fight") {
      Fight(monsterIndex);
    }
  }, [monsterHealth, loc, flag]);

  const ToStore = () =>{
    setLoc("Store")
    setButton1("Buy 10 health (10 gold)")
    setButton2("Buy weapon (30 gold)")
    setButton3("Go to town square")
    setMessage("You enter the store.")
    setMonsterKilled(false)
  }

  const ToCave = () => {
    setLoc("Cave")
    setButton1("Fight slime")
    setButton2("Fight fanged beast")
    setButton3("Go to town square")
    setMessage("You enter the cave. You see some monsters.")
    setMonsterKilled(false)
  }

  const ToTownSquare = () =>{
    setLoc("TownSquare")
    setButton1("Go to store")
    setButton2("Go to cave")
    setButton3("Fight dragon")
    if(monsterKilled===false){
      setMessage("You are in the Town Square.")
    }else{
      setMessage("You have killed the monster.<br />You have gained xp and gold.<br />You have been brought back to the town square.")
    }
    setRedDiv("")
    setMonsterHealth(0)
    setMonsterIndex(-1)
    setDodgeMessage("")
  }

  return (
    <div className='min-w-screen min-h-screen flex bg-black'>
      <div className='bg-white my-auto mx-auto w-[50%] p-2'>
        <div className='border'>
          <div className='border-b-2 flex p-1'>
            <p className='mr-5'>XP: <span className='font-bold'>{xp}</span></p>
            <p className='mr-5'>Health: <span className='font-bold'>{hp}</span></p>
            <p className=''>Gold: <span className='font-bold'>{gold}</span></p>
          </div>
          <div className='flex p-2'>
            <button className={`bg-amber-300 border-orange-500 border-2 mr-1 px-1 cursor-pointer`} onClick={()=>{
              if(loc==="TownSquare"){ToStore()}
              else if(loc==="Store"){BuyHealth()}
              else if(loc==="Cave"){Fight(0)}
              else if(loc==="Fight"){Attack()}
              else if(loc==="Replay"){Reset()}
            }}>{button1}</button>
            <button className={`bg-amber-300 border-orange-500 border-2 mr-1 px-1 cursor-pointer`} onClick={()=>{
              if(loc==="TownSquare"){ToCave()}
              else if(loc==="Store"){BuyWeapon()}
              else if(loc==="Cave"){Fight(1)}
              else if(loc==="Fight"){
                setDodgeMessage(`You have dodged the attack from ${monsters[monsterIndex].name}`)
                Fight(monsterIndex)
              }
              else if(loc==="Replay"){Reset()}
            }}>{button2}</button>
            <button className={`bg-amber-300 border-orange-500 border-2 px-1 cursor-pointer`} onClick={()=>{
              if(loc==="TownSquare"){Fight(2)}
              else if(loc==="Store"||loc==="Cave"||loc==="Fight"){ToTownSquare()}
              else if(loc==="Replay"){Reset()}
            }}>{button3}</button>
          </div>
          {redDiv?<p className='bg-red-600 text-white p-1' dangerouslySetInnerHTML={{ __html: redDiv }}></p>:""}
          {dodgeMessage?<p className='bg-black text-white p-1'>{dodgeMessage}</p>:<p className='bg-black text-white p-1' dangerouslySetInnerHTML={{ __html: message }}></p>}
        </div>
      </div>
    </div>
  )
}

export default App
