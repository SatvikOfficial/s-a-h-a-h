import Image from 'next/image'

const picks = [
  {
    image: '/ambedgar.webp',
    alt: 'डॉ. भीमराव अंबेडकर',
    name: 'डॉ. भीमराव अंबेडकर',
  },
  {
    image: '/Shivaji_British_Museum.jpg',
    alt: 'छत्रपति शिवाजी महाराज',
    name: 'छत्रपति शिवाजी महाराज',
  },
]

export function TributeBar() {
  return (
    <div className="border-b border-gold/20 bg-background/80 py-2">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-1 sm:px-6">
        <div className="flex flex-col items-center gap-1">
          <div className="size-16 overflow-hidden rounded-full ring-1 ring-gold/40 sm:size-20">
            <Image
              src={picks[0].image}
              alt={picks[0].alt}
              width={80}
              height={80}
              className="size-full object-cover"
            />
          </div>
          <span className="hidden font-serif text-xs text-foreground/70 sm:inline">{picks[0].name}</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="hidden font-serif text-xs text-foreground/70 sm:inline">{picks[1].name}</span>
          <div className="size-16 overflow-hidden rounded-full ring-1 ring-gold/40 sm:size-20">
            <Image
              src={picks[1].image}
              alt={picks[1].alt}
              width={80}
              height={80}
              className="size-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
