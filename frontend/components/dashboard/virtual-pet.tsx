"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { VirtualPet as VirtualPetType, PetAccessory } from "@/types/gamification"
import { Heart, Zap, Clock, Plus } from "lucide-react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock pet accessories
const availableAccessories: PetAccessory[] = [
  {
    id: "acc1",
    name: "Dean's Hat",
    description: "A magical hat that boosts XP gain",
    slot: "head",
    iconUrl: "🧙‍♂️",
    position: {
      top: '-1.5rem', // Custom position - higher than default
      left: '60%', // Custom position - shifted to the right
    },
    stats: {
      xpBoost: 5,
    },
  },
  {
    id: "acc2",
    name: "Busico's Robe",
    description: "A scholarly robe that increases energy",
    slot: "body",
    iconUrl: "👘",
    position: {
      top: '40%', // Custom position - slightly higher than center
      left: '50%',
      transform: 'translate(-50%, -50%)',
      opacity: '0.8', // Custom opacity
    },
    stats: {
      energyBoost: 10,
    },
  },
  {
    id: "acc3",
    name: "Lucky Boots",
    description: "Boots that increase happiness",
    slot: "feet",
    iconUrl: "👢",
    position: {
      bottom: '-0.75rem', // Custom position - lower than default
      left: '40%', // Custom position - shifted to the left
      transform: 'translateX(-50%)',
      fontSize: '1rem', // Custom size - larger than default
    },
    stats: {
      happinessBoost: 15,
    },
  },
  {
    id: "acc4",
    name: "Library Background",
    description: "A cozy library setting for your pet",
    slot: "background",
    iconUrl: "📚",
    position: {
      opacity: '0.15', // Custom opacity - less transparent than default
      fontSize: '3rem', // Custom size - larger than default
    },
  },
]

// Mock pet data
const mockPet: VirtualPetType = {
  id: "pet1",
  name: "Derrick",
  species: "Owl",
  level: 3,
  happiness: 70,
  energy: 60,
  lastFed: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
  lastPlayed: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
  accessories: [availableAccessories[0]],
  iconUrl: "/pets/pet-cat.png",
}

export function VirtualPet() {
  const [pet, setPet] = useState<VirtualPetType>(mockPet)
  const [activeTab, setActiveTab] = useState("interact")
  const [showAccessories, setShowAccessories] = useState(false)

  // Calculate time since last interaction
  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffHrs < 1) {
      return "Less than an hour ago"
    } else if (diffHrs === 1) {
      return "1 hour ago"
    } else {
      return `${diffHrs} hours ago`
    }
  }

  const feedPet = () => {
    setPet({
      ...pet,
      energy: Math.min(100, pet.energy + 20),
      lastFed: new Date().toISOString(),
    })
  }

  const playWithPet = () => {
    setPet({
      ...pet,
      happiness: Math.min(100, pet.happiness + 15),
      energy: Math.max(0, pet.energy - 10),
      lastPlayed: new Date().toISOString(),
    })
  }

  const equipAccessory = (accessory: PetAccessory) => {
    // Remove any existing accessory in the same slot
    const filteredAccessories = pet.accessories.filter((acc) => acc.slot !== accessory.slot)

    setPet({
      ...pet,
      accessories: [...filteredAccessories, accessory],
      happiness: Math.min(100, pet.happiness + 5),
    })

    setShowAccessories(false)
  }

  // Simulate pet stats decreasing over time
  useEffect(() => {
    const interval = setInterval(() => {
      setPet((prevPet) => ({
        ...prevPet,
        happiness: Math.max(0, prevPet.happiness - 1),
        energy: Math.max(0, prevPet.energy - 0.5),
      }))
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Virtual Pet</span>
          <span className="text-sm font-normal">Level {pet.level}</span>
        </CardTitle>
        <CardDescription>Take care of your learning companion</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            {/* Background accessory */}
            {pet.accessories.find((acc) => acc.slot === "background") && (
              (() => {
                const accessory = pet.accessories.find((acc) => acc.slot === "background");
                const defaultStyle = {
                  position: 'absolute',
                  inset: '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.25rem',
                  opacity: '0.2'
                };
                const customStyle = accessory?.position || {};

                return (
                  <div style={{...defaultStyle, ...customStyle}}>
                    {accessory?.iconUrl}
                  </div>
                );
              })()
            )}

            {/* Pet with accessories */}
            <div className="relative" style={{ width: '96px', height: '96px' }}>
              <Image 
                src={pet.iconUrl} 
                alt={`${pet.name} the ${pet.species}`}
                width={96}
                height={96}
                priority
              />

              {/* Head accessory */}
              {pet.accessories.find((acc) => acc.slot === "head") && (
                (() => {
                  const accessory = pet.accessories.find((acc) => acc.slot === "head");
                  const defaultStyle = {
                    position: 'absolute',
                    top: '-1rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '1.25rem'
                  };
                  const customStyle = accessory?.position || {};

                  return (
                    <div style={{...defaultStyle, ...customStyle}}>
                      {accessory?.iconUrl}
                    </div>
                  );
                })()
              )}

              {/* Body accessory */}
              {pet.accessories.find((acc) => acc.slot === "body") && (
                (() => {
                  const accessory = pet.accessories.find((acc) => acc.slot === "body");
                  const defaultStyle = {
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '1.25rem',
                    opacity: '0.7'
                  };
                  const customStyle = accessory?.position || {};

                  return (
                    <div style={{...defaultStyle, ...customStyle}}>
                      {accessory?.iconUrl}
                    </div>
                  );
                })()
              )}

              {/* Feet accessory */}
              {pet.accessories.find((acc) => acc.slot === "feet") && (
                (() => {
                  const accessory = pet.accessories.find((acc) => acc.slot === "feet");
                  const defaultStyle = {
                    position: 'absolute',
                    bottom: '-0.5rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '0.875rem'
                  };
                  const customStyle = accessory?.position || {};

                  return (
                    <div style={{...defaultStyle, ...customStyle}}>
                      {accessory?.iconUrl}
                    </div>
                  );
                })()
              )}
            </div>
          </div>

          <div className="text-xl font-bold mb-2">
            {pet.name} the {pet.species}
          </div>

          <div className="w-full space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <div className="flex items-center">
                  <Heart className="h-4 w-4 mr-1 text-red-500" />
                  <span>Happiness</span>
                </div>
                <span>{pet.happiness}%</span>
              </div>
              <Progress value={pet.happiness} className="h-2" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <div className="flex items-center">
                  <Zap className="h-4 w-4 mr-1 text-yellow-500" />
                  <span>Energy</span>
                </div>
                <span>{pet.energy}%</span>
              </div>
              <Progress value={pet.energy} className="h-2" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>Last fed: {getTimeSince(pet.lastFed)}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>Last played: {getTimeSince(pet.lastPlayed)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Tabs defaultValue="interact" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="interact">Interact</TabsTrigger>
            <TabsTrigger value="customize">Customize</TabsTrigger>
          </TabsList>

          <TabsContent value="interact" className="space-y-2 pt-2">
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={feedPet} disabled={pet.energy >= 100}>
                Feed Pet
              </Button>
              <Button onClick={playWithPet} disabled={pet.energy <= 0}>
                Play
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="customize" className="pt-2">
            <Dialog open={showAccessories} onOpenChange={setShowAccessories}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Accessories
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Pet Accessories</DialogTitle>
                  <DialogDescription>Customize your pet with special items that boost their stats</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  {availableAccessories.map((accessory) => (
                    <Button
                      key={accessory.id}
                      variant="outline"
                      className="flex flex-col h-auto p-4"
                      onClick={() => equipAccessory(accessory)}
                    >
                      <div className="text-2xl mb-2">{accessory.iconUrl}</div>
                      <div className="text-sm font-medium">{accessory.name}</div>
                      <div className="text-xs text-muted-foreground">{accessory.description}</div>
                    </Button>
                  ))}
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAccessories(false)}>
                    Cancel
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </CardFooter>
    </Card>
  )
}
