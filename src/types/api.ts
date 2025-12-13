// API Response Types

export interface Chat {
  chatid: string
  chatname: string
  isAdmin: boolean
}

export interface Message {
  id: number
  messageid?: string
  text?: string
  photo?: string
  photoid?: string
  position?: string
  chatid?: number
  time?: string
  timestamp?: string
  userid?: string
  usernick?: string
  nickname?: string
  userhash?: string
  // Add other message properties as needed
}

export interface Profile {
  userid: string
  nickname: string
  fullname: string
  userhash?: string
}

export interface Invite {
  chatid: string
  chatname: string
  invitedhash: string
  // Add other invite properties as needed
}

export interface ApiResponse<T> {
  data?: T
  error?: string
}
