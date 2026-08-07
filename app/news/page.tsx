'use client'

import { useState, useEffect, useRef } from 'react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Loader2, ExternalLink, Newspaper, ChevronRight, Info } from 'lucide-react'
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'

interface NewsArticle {
  title: string
  description: string
  url: string
  urlToImage: string | null
  source: { name: string }
  publishedAt: string
}

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Mobile swipe state
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    async function fetchNews() {
      try {
        setLoading(true)
        // Using Saurav Kanchan's free open-source NewsAPI clone for Indian top headlines
        const res = await fetch('https://saurav.tech/NewsAPI/top-headlines/category/general/in.json')
        if (!res.ok) throw new Error('Failed to fetch news')
        
        const data = await res.json()
        if (data && data.articles) {
          // Filter out articles with removed titles or missing descriptions
          const validArticles = data.articles.filter((a: NewsArticle) => 
            a.title && !a.title.includes('[Removed]') && a.description
          )
          setArticles(validArticles)
        }
      } catch (err) {
        console.error(err)
        setError('समाचार लोड करने में विफल। कृपया बाद में पुनः प्रयास करें। (Failed to load news)')
      } finally {
        setLoading(false)
      }
    }
    
    fetchNews()
  }, [])

  // Mobile Tinder-style Card Component
  const SwipeableCard = ({ article, isFront, onSwipe }: { article: NewsArticle, isFront: boolean, onSwipe: () => void }) => {
    const x = useMotionValue(0)
    const rotate = useTransform(x, [-200, 200], [-10, 10])
    const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0])
    
    const handleDragEnd = (e: any, info: any) => {
      if (Math.abs(info.offset.x) > 100) {
        onSwipe()
      }
    }

    return (
      <motion.div
        style={{ x, rotate, opacity }}
        drag={isFront ? "x" : false}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        onDragEnd={handleDragEnd}
        animate={{ scale: isFront ? 1 : 0.95, y: isFront ? 0 : 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`absolute w-full h-full max-h-[70vh] rounded-2xl border border-gold/30 bg-background/90 backdrop-blur shadow-xl overflow-hidden flex flex-col cursor-grab active:cursor-grabbing ${!isFront && 'pointer-events-none'}`}
      >
        {article.urlToImage && (
          <div className="h-48 w-full shrink-0 relative overflow-hidden bg-secondary">
            <img 
              src={article.urlToImage} 
              alt="News thumbnail" 
              className="object-cover w-full h-full pointer-events-none"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          </div>
        )}
        <div className="p-6 flex flex-col flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-primary px-2 py-1 rounded-full bg-primary/10 border border-primary/20">
              {article.source.name}
            </span>
            <span className="text-xs text-foreground/60">
              {new Date(article.publishedAt).toLocaleDateString('hi-IN', { month: 'short', day: 'numeric' })}
            </span>
          </div>
          <h2 className="text-xl font-serif text-primary mb-3 leading-tight">{article.title}</h2>
          <p className="text-foreground/80 text-sm leading-relaxed mb-6">{article.description}</p>
          
          <div className="mt-auto pt-4 border-t border-gold/20 flex justify-between items-center">
            <p className="text-xs text-foreground/50 flex items-center gap-1">
              <Info className="size-3" />
              पढ़ने के लिए स्वाइप करें
            </p>
            <a 
              href={article.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors bg-primary/5 px-3 py-1.5 rounded-full"
              onPointerDown={(e) => e.stopPropagation()}
            >
              पूरा पढ़ें <ExternalLink className="size-3" />
            </a>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-gradient-to-b from-background to-secondary parchment-texture pt-24 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4 border border-primary/20 shadow-sm">
              <Newspaper className="size-6 text-primary" />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-normal text-primary mb-4">
              राष्ट्रीय समाचार व अपडेट
            </h1>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              देशभर से नवीनतम समाचार, सुरक्षा अपडेट और महत्वपूर्ण जानकारियां। हमारे समाज और राष्ट्र से जुड़ी खबरों से अवगत रहें।
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="size-10 animate-spin text-primary/60 mb-4" />
              <p className="text-foreground/60">समाचार लोड हो रहे हैं...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-red-500/10 rounded-xl border border-red-500/20 max-w-lg mx-auto">
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                पुनः प्रयास करें
              </button>
            </div>
          ) : (
            <>
              {/* Mobile Tinder Cards View (visible only on small screens) */}
              <div className="md:hidden relative h-[600px] w-full max-w-md mx-auto flex items-center justify-center perspective-1000">
                {articles.length > 0 ? (
                  <AnimatePresence>
                    {articles.slice(currentIndex, currentIndex + 2).reverse().map((article, index) => {
                      // Because of reverse(), the actual front card is the last one in the array
                      const isFront = index === articles.slice(currentIndex, currentIndex + 2).length - 1
                      return (
                        <SwipeableCard
                          key={article.url + currentIndex} // force remount when index changes if needed
                          article={article}
                          isFront={isFront}
                          onSwipe={() => setCurrentIndex(prev => Math.min(prev + 1, articles.length - 1))}
                        />
                      )
                    })}
                  </AnimatePresence>
                ) : (
                  <p className="text-foreground/60">कोई समाचार उपलब्ध नहीं है।</p>
                )}
                
                {currentIndex >= articles.length - 1 && articles.length > 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-background/50 rounded-2xl border border-gold/30">
                    <div className="p-4 bg-primary/10 rounded-full mb-4">
                      <Newspaper className="size-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-serif text-primary mb-2">आपने सभी खबरें पढ़ ली हैं!</h3>
                    <p className="text-sm text-foreground/60 mb-6">नई खबरों के लिए बाद में वापस आएं।</p>
                    <button 
                      onClick={() => setCurrentIndex(0)}
                      className="px-6 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
                    >
                      फिर से पढ़ें
                    </button>
                  </div>
                )}
              </div>

              {/* Desktop Grid View (visible only on medium+ screens) */}
              <div className="hidden md:grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {articles.map((article, i) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={i}
                    className="group rounded-xl border border-gold/30 bg-background/50 backdrop-blur overflow-hidden flex flex-col hover:shadow-xl hover:shadow-primary/5 hover:border-primary/40 transition-all duration-300"
                  >
                    {article.urlToImage && (
                      <div className="h-48 w-full overflow-hidden bg-secondary relative">
                        <img 
                          src={article.urlToImage} 
                          alt={article.title}
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
                      </div>
                    )}
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-medium text-primary px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
                          {article.source.name}
                        </span>
                        <span className="text-xs text-foreground/50 font-medium">
                          {new Date(article.publishedAt).toLocaleDateString('hi-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <h2 className="text-lg font-serif text-foreground group-hover:text-primary transition-colors mb-3 line-clamp-2 leading-snug">
                        {article.title}
                      </h2>
                      <p className="text-foreground/70 text-sm line-clamp-3 mb-6 flex-1">
                        {article.description}
                      </p>
                      <a 
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors mt-auto w-fit group/link"
                      >
                        पूरा लेख पढ़ें 
                        <ChevronRight className="size-4 group-hover/link:translate-x-1 transition-transform" />
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
