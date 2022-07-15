import { useCallback, useRef, useState } from 'react'
import useFileInput from './useFileInput'
import { decodeAudioFile } from './utils/audioUtils'
import { WizardFile } from './types/index'

export interface UseFileWizardProps {
  type: 'audio' | 'image' | 'video' | 'document'
  onLoad?: (file: WizardFile) => void
}

export default function useFileWizard(props: UseFileWizardProps) {
  const { type, onLoad } = props
  const [loading, setLoading] = useState<boolean>(false)
  const [file, setFile] = useState<WizardFile>({ readerFile: null })
  const fileReader = useRef<FileReader>(new FileReader())

  const handleInputChange = useCallback((e: Event) => {
    const readerFile = (e.target as HTMLInputElement).files![0]

    fileReader.current.onloadstart = () => setLoading(true)
    fileReader.current.onload = () => handleReaderLoad(readerFile)

    if (type === 'audio') fileReader.current.readAsArrayBuffer(readerFile)
  }, [])

  const fileInput = useFileInput({
    type: type !== 'document' ? type : null,
    onChange: handleInputChange,
  })

  const handleReaderLoad = useCallback((readerFile: File) => {
    const readerDecode = fileReader.current.result

    if (type === 'audio') {
      const handleDecodeSuccess: DecodeSuccessCallback = (dd: AudioBuffer) => {
        const file = { readerFile, readerDecode, audioData: dd }
        setFile(file)
        onLoad?.(file)
        setLoading(false)
      }
      decodeAudioFile(readerDecode as ArrayBuffer, handleDecodeSuccess)
    }
  }, [])

  return {
    file,
    loading,
    click: () => fileInput.current.click(),
    clear: () => {
      fileInput.current.value = ''
      fileReader.current.onload = null
      setFile({ readerFile: null })
      setLoading(false)
    },
  }
}
