import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { AIChatWindow } from './AIChatWindow'

export function AIFloatingWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [hasMoved, setHasMoved] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)

  // 初始化位置（右下角）
  useEffect(() => {
    setPosition({
      x: window.innerWidth - 76,
      y: window.innerHeight - 76,
    })
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isOpen) return
    setIsDragging(true)
    setHasMoved(false)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      const newX = e.clientX - dragStart.x
      const newY = e.clientY - dragStart.y
      
      // 如果移动超过 5px，认为是拖动
      if (Math.abs(newX - position.x) > 5 || Math.abs(newY - position.y) > 5) {
        setHasMoved(true)
      }
      
      // 限制在视口内
      const padding = 20
      const buttonSize = 56
      const maxX = window.innerWidth - buttonSize - padding
      const maxY = window.innerHeight - buttonSize - padding
      
      setPosition({
        x: Math.max(padding, Math.min(newX, maxX)),
        y: Math.max(padding, Math.min(newY, maxY)),
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragStart, position])

  const handleClick = () => {
    // 只有在非拖动情况下才切换窗口状态
    if (!hasMoved) {
      setIsOpen(!isOpen)
    }
  }

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        className={`fixed w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95 z-50 ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{
          left: position.x,
          top: position.y,
        }}
        title="AI 助手"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>

      <AIChatWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
