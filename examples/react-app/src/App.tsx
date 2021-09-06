import React, { useEffect, useRef, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

function useInterval(callback: () => void, delay?: number) {
  const savedCallback = useRef(callback)

  // Remember the latest callback if it changes.
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval.
  useEffect(() => {
    let customDelay = delay ?? 10000

    const id = setInterval(() => savedCallback.current(), customDelay)

    return () => clearInterval(id)
  }, [delay])
}


interface UseV0FeatureFlagOptions {
  defaultValue?: boolean
}
function useV0FeatureFlag(key: string, opts?: UseV0FeatureFlagOptions) {
  const defaultValue = opts?.defaultValue ?? false;
  const [featureFlagValue, setFeatureFlagValue] = useState(defaultValue)
  const {sendMessage, lastMessage, readyState} = useWebSocket('wss://wsapi.toglion.com')

  useEffect(() => {
    setFeatureFlagValue(lastMessage !== null)
    console.log(lastMessage)
    if (lastMessage !== null && lastMessage.data) {
      const message = JSON.parse(lastMessage.data) as {type?: string}
      if (message?.type === "connection_ack") {
        console.log("here!")
        sendMessage(JSON.stringify({
          "type":"subscribe",
          "payload": {
            "query": `subscription { v0Flag(key:"${key}") }`
          }
        }))
      }
    }
  }, [key, sendMessage, lastMessage])
  useEffect(() => {
    if (readyState === ReadyState.OPEN) {
      sendMessage(JSON.stringify({type: 'connection_init'}))
    }
  }, [sendMessage, readyState])
  useInterval(() => {
    if (readyState === ReadyState.OPEN) {
      sendMessage(JSON.stringify({type: 'ping'}))
    }
  })


  return {featureFlagValue, sendMessage}
}


function App() {
  const {featureFlagValue} = useV0FeatureFlag('hello')
  
  return (
    <div>
      {JSON.stringify(featureFlagValue)}
    </div>
  );
}

export default App;
