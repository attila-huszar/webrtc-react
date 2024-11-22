import { collection, onSnapshot, addDoc } from 'firebase/firestore'
import { firestore } from '../config/firebase'

export const setupIceCandidateHandler = (
  peerConnection: RTCPeerConnection,
  roomId: string,
) => {
  peerConnection.onicecandidate = async (event) => {
    if (event.candidate) {
      const candidatesRef = collection(firestore, 'rooms', roomId, 'candidates')
      await addDoc(candidatesRef, event.candidate.toJSON())
    }
  }
}

export const listenForIceCandidates = (
  peerConnection: RTCPeerConnection,
  roomId: string,
) => {
  const candidatesRef = collection(firestore, 'rooms', roomId, 'candidates')

  onSnapshot(candidatesRef, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const candidate = new RTCIceCandidate(change.doc.data())
        peerConnection.addIceCandidate(candidate)
      }
    })
  })
}
