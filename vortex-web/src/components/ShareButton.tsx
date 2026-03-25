type ShareButtonProps = {
  title: string
  url?: string
  text?: string
}

export function ShareButton({ title, url, text }: ShareButtonProps) {
  const shareUrl = url || window.location.href
  const shareText = text || `Check out ${title} on Vortex!`

  const platforms = [
    {
      name: 'Twitter',
      icon: '𝕏',
      link: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'WhatsApp',
      icon: '📱',
      link: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
    },
    {
      name: 'Copy',
      icon: '🔗',
      link: '',
    },
  ]

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
    } catch {
      // fallback
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="font-accent text-[8px] text-zinc-500 uppercase tracking-widest mr-2">SHARE</span>
      {platforms.map(p => (
        p.link ? (
          <a
            key={p.name}
            href={p.link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 flex items-center justify-center border border-zinc-700 text-zinc-400 hover:border-primary hover:text-primary transition-all text-sm"
            title={`Share on ${p.name}`}
          >
            {p.icon}
          </a>
        ) : (
          <button
            key={p.name}
            onClick={copyToClipboard}
            className="w-9 h-9 flex items-center justify-center border border-zinc-700 text-zinc-400 hover:border-primary hover:text-primary transition-all text-sm"
            title="Copy link"
          >
            {p.icon}
          </button>
        )
      ))}
    </div>
  )
}
