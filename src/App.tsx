import { useEffect, useRef, useState } from 'react'
import { peerConnection } from './config/webRTC'
import { createRoom, joinRoom } from './services/rooms'
import { listenForIceCandidates } from './services/signaling'

const App = () => {
  const [roomId, setRoomId] = useState<string | null>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  const startCall = async () => {
    const roomId = await createRoom(peerConnection)
    setRoomId(roomId)
  }

  const joinCall = async (id: string | null) => {
    if (!id) return

    await joinRoom(peerConnection, id)
    listenForIceCandidates(peerConnection, id)
  }

  useEffect(() => {
    const setupMedia = async () => {
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream
      }

      localStream
        .getTracks()
        .forEach((track) => peerConnection.addTrack(track, localStream))
    }

    setupMedia()

    peerConnection.ontrack = (event) => {
      const remoteStream = new MediaStream()
      event.streams[0]
        .getTracks()
        .forEach((track) => remoteStream.addTrack(track))

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream
      }
    }
  }, [])

  return (
    <div>
      <div>
        <video ref={localVideoRef} autoPlay playsInline></video>
        <video ref={remoteVideoRef} autoPlay playsInline></video>
      </div>
      <div>
        <button onClick={startCall}>Create Room</button>
        <button onClick={() => joinCall(prompt('Enter Room ID:'))}>
          Join Room
        </button>
      </div>
      <p>Room ID: {roomId}</p>
    </div>
  )
}

export default App
