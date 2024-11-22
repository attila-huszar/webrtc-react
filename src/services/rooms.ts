import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { firestore } from '../config/firebase'

export const createRoom = async (peerConnection: RTCPeerConnection) => {
  const roomRef = doc(collection(firestore, 'rooms'))
  const offer = await peerConnection.createOffer()

  await peerConnection.setLocalDescription(offer)

  await setDoc(roomRef, { offer: JSON.parse(JSON.stringify(offer)) })

  console.log(`Room created with ID: ${roomRef.id}`)
  return roomRef.id
}

export const joinRoom = async (
  peerConnection: RTCPeerConnection,
  roomId: string,
) => {
  const roomRef = doc(firestore, 'rooms', roomId)
  const roomSnapshot = await getDoc(roomRef)

  if (roomSnapshot.exists()) {
    const offer = roomSnapshot.data().offer
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))

    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)

    await updateDoc(roomRef, { answer: JSON.parse(JSON.stringify(answer)) })

    console.log(`Joined room with ID: ${roomId}`)
  } else {
    console.error('Room not found!')
  }
}
