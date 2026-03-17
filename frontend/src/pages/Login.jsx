/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(null)
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 })
  const { login } = useAuth()
  const navigate = useNavigate()
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let W = canvas.width = window.innerWidth
    let H = canvas.height = window.innerHeight

    // Rich plastered colour palette
    const palette = [
      { h: 12,  s: 85, l: 65 },  // coral
      { h: 38,  s: 90, l: 60 },  // amber
      { h: 165, s: 70, l: 55 },  // emerald
      { h: 210, s: 80, l: 60 },  // sky
      { h: 270, s: 75, l: 65 },  // violet
      { h: 330, s: 80, l: 65 },  // rose
      { h: 50,  s: 95, l: 58 },  // gold
      { h: 190, s: 75, l: 55 },  // teal
    ]

    const blobs = Array.from({ length: 22 }, (_, i) => {
      const c = palette[i % palette.length]
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        r: 80 + Math.random() * 200,
        dx: (Math.random() - 0.5) * 0.35,
        dy: (Math.random() - 0.5) * 0.35,
        h: c.h + (Math.random() - 0.5) * 20,
        s: c.s,
        l: c.l,
        alpha: 0.06 + Math.random() * 0.09,
        phase: Math.random() * Math.PI * 2,
        speed: 0.004 + Math.random() * 0.006,
      }
    })

    let t = 0, animId
    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      t += 0.01

      blobs.forEach(b => {
        b.x += b.dx; b.y += b.dy
        if (b.x < -b.r) b.x = W + b.r
        if (b.x > W + b.r) b.x = -b.r
        if (b.y < -b.r) b.y = H + b.r
        if (b.y > H + b.r) b.y = -b.r

        const pulse = 1 + 0.12 * Math.sin(t + b.phase)
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * pulse)
        g.addColorStop(0,   `hsla(${b.h},${b.s}%,${b.l}%,${b.alpha * 1.8})`)
        g.addColorStop(0.4, `hsla(${b.h},${b.s}%,${b.l}%,${b.alpha})`)
        g.addColorStop(1,   `hsla(${b.h},${b.s}%,${b.l}%,0)`)
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r * pulse, 0, Math.PI * 2)
        ctx.fillStyle = g
        ctx.fill()
      })

      animId = requestAnimationFrame(draw)
    }
    draw()
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight }
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  useEffect(() => {
    const h = e => setMouse({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight })
    window.addEventListener('mousemove', h)
    return () => window.removeEventListener('mousemove', h)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    if (!email || !password) { setError('Please fill in all fields'); setLoading(false); return }
    const result = await login(email, password)
    if (result.success) { navigate('/chat') } else { setError(result.message) }
    setLoading(false)
  }

  const tx = (mouse.y - 0.5) * 8
  const ty = (mouse.x - 0.5) * -8

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,300;1,9..144,400&family=Syne:wght@400;500;600;700&display=swap');

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

        .pg {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          /* Warm creamy base that lets colours bleed through beautifully */
          background: #fdf6ee;
          font-family: 'Syne', sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* Warm noise texture */
        .pg::after {
          content:'';
          position:fixed;
          inset:0;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E");
          pointer-events:none;
          z-index:1;
          mix-blend-mode: multiply;
        }

        .cv {
          position:fixed;inset:0;
          pointer-events:none;z-index:0;
          /* soft blur so colours bleed and feel plastered */
          filter: blur(0px);
        }

        /* Frosted overlay to unify all the colour blobs */
        .frost {
          position:fixed;inset:0;
          background: rgba(253,246,238,0.28);
          backdrop-filter: blur(60px) saturate(140%);
          -webkit-backdrop-filter: blur(60px) saturate(140%);
          pointer-events:none;z-index:2;
        }

        /* Subtle halftone dot grid */
        .dots {
          position:fixed;inset:0;
          background-image: radial-gradient(circle, rgba(60,20,0,0.04) 1px, transparent 1px);
          background-size: 24px 24px;
          pointer-events:none;z-index:2;
        }

        .wrap {
          position:relative;z-index:10;
          width:100%;max-width:460px;
          padding:0 1.25rem;
        }

        /* ─── BOT ─── */
        .bot-zone {
          display:flex;flex-direction:column;align-items:center;
          margin-bottom:2rem;
        }

        .bot-frame {
          position:relative;width:116px;height:116px;
          display:flex;align-items:center;justify-content:center;
          margin-bottom:1.5rem;
        }

        /* Multi-layer spinning rings */
        .ring {
          position:absolute;border-radius:50%;
          border-style:solid;
          animation:rspin linear infinite;
        }
        .ring-1{inset:-2px;border-width:1.5px;border-color:rgba(234,88,12,0.3) transparent rgba(234,88,12,0.3) transparent;animation-duration:8s;}
        .ring-2{inset:-12px;border-width:1px;border-color:transparent rgba(124,58,237,0.2) transparent rgba(124,58,237,0.2);animation-duration:14s;animation-direction:reverse;}
        .ring-3{inset:-22px;border-width:1px;border-color:rgba(16,185,129,0.15) transparent rgba(16,185,129,0.15) transparent;animation-duration:22s;}
        @keyframes rspin{to{transform:rotate(360deg)}}

        /* Two orbiting planets */
        .planet {
          position:absolute;border-radius:50%;
          top:50%;left:50%;
          transform-origin:0 0;
        }
        .planet-a {
          width:9px;height:9px;
          background:linear-gradient(135deg,#fb923c,#f59e0b);
          box-shadow:0 0 10px 3px rgba(251,146,60,0.5);
          animation:orbit-a 5s linear infinite;
        }
        .planet-b {
          width:6px;height:6px;
          background:linear-gradient(135deg,#a78bfa,#7c3aed);
          box-shadow:0 0 8px 2px rgba(167,139,250,0.5);
          animation:orbit-b 8s linear infinite reverse;
        }
        .planet-c {
          width:5px;height:5px;
          background:linear-gradient(135deg,#34d399,#059669);
          box-shadow:0 0 7px 2px rgba(52,211,153,0.5);
          animation:orbit-c 11s linear infinite;
        }
        @keyframes orbit-a{0%{transform:rotate(0deg) translate(56px) rotate(0deg)}100%{transform:rotate(360deg) translate(56px) rotate(-360deg)}}
        @keyframes orbit-b{0%{transform:rotate(120deg) translate(66px) rotate(-120deg)}100%{transform:rotate(480deg) translate(66px) rotate(-480deg)}}
        @keyframes orbit-c{0%{transform:rotate(240deg) translate(50px) rotate(-240deg)}100%{transform:rotate(600deg) translate(50px) rotate(-600deg)}}

        .bot-shell {
          width:92px;height:92px;border-radius:50%;
          background:rgba(255,255,255,0.82);
          border:1.5px solid rgba(255,255,255,0.95);
          box-shadow:
            0 0 0 8px rgba(255,255,255,0.3),
            0 12px 40px rgba(200,100,50,0.12),
            0 4px 16px rgba(0,0,0,0.08),
            inset 0 2px 0 rgba(255,255,255,1),
            inset 0 -2px 6px rgba(180,80,30,0.05);
          backdrop-filter:blur(12px);
          display:flex;align-items:center;justify-content:center;
          position:relative;z-index:1;
          overflow:hidden;
        }

        /* Inner rainbow shimmer on shell */
        .bot-shell::before {
          content:'';position:absolute;inset:0;border-radius:50%;
          background:conic-gradient(
            from 0deg,
            rgba(251,146,60,0.08),
            rgba(167,139,250,0.08),
            rgba(52,211,153,0.08),
            rgba(96,165,250,0.08),
            rgba(251,146,60,0.08)
          );
          animation:shellSpin 10s linear infinite;
        }
        @keyframes shellSpin{to{transform:rotate(360deg)}}

        .bot-svg {
          width:50px;height:50px;
          position:relative;z-index:1;
          animation:botDance 3s ease-in-out infinite;
        }
        @keyframes botDance {
          0%,100%{transform:translateY(0) rotate(-1.5deg);}
          20%{transform:translateY(-5px) rotate(0deg);}
          40%{transform:translateY(-8px) rotate(1.5deg);}
          60%{transform:translateY(-5px) rotate(0.5deg);}
          80%{transform:translateY(-2px) rotate(-0.5deg);}
        }
        .bot-eyes{animation:blink 4.5s ease-in-out infinite;transform-origin:center 20px;}
        @keyframes blink{0%,82%,100%{transform:scaleY(1)}90%{transform:scaleY(0.06)}}
        .ant-pulse{animation:apulse 2s ease-in-out infinite;}
        @keyframes apulse{0%,100%{opacity:0.5}50%{opacity:1;filter:drop-shadow(0 0 5px currentColor)}}

        /* TITLE */
        .title-block{text-align:center;margin-bottom:0;}
        .title-main {
          font-family:'Fraunces',serif;
          font-size:2.1rem;font-weight:300;
          color:#1c0a00;
          letter-spacing:-0.02em;
          line-height:1.1;
        }
        .title-main em {
          font-style:italic;
          background:linear-gradient(135deg,#ea580c 0%,#d97706 35%,#7c3aed 70%,#059669 100%);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;
          background-clip:text;
        }
        .title-tag {
          font-size:0.65rem;color:#a07850;
          letter-spacing:0.2em;text-transform:uppercase;
          font-weight:600;font-family:'Syne',sans-serif;
          margin-top:0.3rem;
          display:flex;align-items:center;justify-content:center;gap:8px;
        }
        .title-tag::before,.title-tag::after{content:'';flex:1;max-width:40px;height:1px;background:linear-gradient(90deg,transparent,#d4a870);}
        .title-tag::after{background:linear-gradient(90deg,#d4a870,transparent);}

        /* ─── CARD ─── */
        .card {
          margin-top:1.5rem;
          background:rgba(255,252,248,0.72);
          border:1px solid rgba(255,255,255,0.85);
          border-radius:28px;
          padding:2.5rem 2.25rem;
          backdrop-filter:blur(40px) saturate(160%);
          -webkit-backdrop-filter:blur(40px) saturate(160%);
          box-shadow:
            0 2px 4px rgba(200,100,30,0.04),
            0 8px 24px rgba(200,100,30,0.08),
            0 24px 60px rgba(180,80,20,0.06),
            0 48px 100px rgba(0,0,0,0.04),
            inset 0 1.5px 0 rgba(255,255,255,1),
            inset 0 -1px 0 rgba(200,120,60,0.08);
          position:relative;overflow:hidden;
        }

        /* Colourful top border sweep */
        .card::before {
          content:'';position:absolute;
          top:0;left:0;right:0;height:2px;
          background:linear-gradient(90deg,
            #fb923c 0%,#f59e0b 20%,
            #34d399 40%,#60a5fa 60%,
            #a78bfa 80%,#fb923c 100%
          );
          background-size:200% 100%;
          animation:sweep 5s linear infinite;
          border-radius:28px 28px 0 0;
        }
        @keyframes sweep{0%{background-position:0% 0%}100%{background-position:200% 0%}}

        /* Soft inner warm glow */
        .card::after {
          content:'';position:absolute;
          top:-40px;left:50%;transform:translateX(-50%);
          width:240px;height:80px;
          background:radial-gradient(ellipse,rgba(251,146,60,0.06) 0%,transparent 70%);
          pointer-events:none;
        }

        /* Corner flourishes */
        .cf {
          position:absolute;width:32px;height:32px;
          border-radius:4px;
          opacity:0.4;
        }
        .cf-tl{top:14px;left:14px;
          border-top:2px solid #fb923c;border-left:2px solid #fb923c;}
        .cf-tr{top:14px;right:14px;
          border-top:2px solid #a78bfa;border-right:2px solid #a78bfa;}
        .cf-bl{bottom:14px;left:14px;
          border-bottom:2px solid #34d399;border-left:2px solid #34d399;}
        .cf-br{bottom:14px;right:14px;
          border-bottom:2px solid #60a5fa;border-right:2px solid #60a5fa;}

        /* Status */
        .status {
          display:flex;align-items:center;justify-content:center;
          gap:8px;margin-bottom:2rem;
        }
        .s-pip {
          width:8px;height:8px;border-radius:50%;
          background:linear-gradient(135deg,#34d399,#059669);
          box-shadow:0 0 0 3px rgba(52,211,153,0.2);
          animation:spp 2.5s ease-in-out infinite;
        }
        @keyframes spp{0%,100%{box-shadow:0 0 0 3px rgba(52,211,153,0.2)}50%{box-shadow:0 0 0 7px rgba(52,211,153,0.07)}}
        .s-txt{font-size:0.62rem;color:#a07850;letter-spacing:0.16em;text-transform:uppercase;font-weight:600;}

        /* Error */
        .err {
          display:flex;align-items:center;gap:8px;
          background:linear-gradient(135deg,rgba(254,226,226,0.8),rgba(255,237,213,0.8));
          border:1px solid rgba(252,165,165,0.5);
          border-radius:12px;padding:0.7rem 1rem;
          margin-bottom:1.25rem;
          font-size:0.8rem;color:#c2410c;
          box-shadow:0 2px 8px rgba(234,88,12,0.08);
        }

        /* Fields */
        .fg{margin-bottom:1.4rem;}
        .fl {
          display:flex;align-items:center;gap:7px;
          font-size:0.65rem;font-weight:700;
          color:#92614a;letter-spacing:0.12em;
          text-transform:uppercase;margin-bottom:0.55rem;
        }
        .fl-gem {
          width:6px;height:6px;
          border-radius:1px;
          transform:rotate(45deg);
          background:#e2c9a0;
          transition:all 0.25s;
          flex-shrink:0;
        }
        .fl-gem.on {background:linear-gradient(135deg,#fb923c,#f59e0b);box-shadow:0 0 6px rgba(251,146,60,0.5);}

        .fw{position:relative;}
        .fi {
          position:absolute;left:14px;top:50%;
          transform:translateY(-50%);
          pointer-events:none;transition:all 0.25s;
          color:#d4b896;
        }
        .fi.on{color:#ea580c;}

        .inp {
          width:100%;
          background:rgba(255,249,242,0.7);
          border:1.5px solid rgba(220,185,150,0.4);
          border-radius:14px;
          padding:0.85rem 0.875rem 0.85rem 2.65rem;
          color:#1c0a00;
          font-family:'Syne',sans-serif;
          font-size:0.9rem;font-weight:400;
          outline:none;
          transition:all 0.3s;
          box-shadow:inset 0 1px 2px rgba(180,100,30,0.04);
        }
        .inp::placeholder{color:#d4c0a8;}
        .inp:focus {
          border-color:rgba(251,146,60,0.6);
          background:rgba(255,253,249,0.92);
          box-shadow:
            0 0 0 3px rgba(251,146,60,0.1),
            inset 0 1px 3px rgba(180,100,30,0.03);
        }

        /* Colour bar */
        .fbar {
          height:2px;margin-top:4px;
          background:linear-gradient(90deg,#fb923c,#f59e0b,#34d399,#60a5fa,#a78bfa);
          background-size:200% 100%;
          border-radius:2px;
          transform:scaleX(0);transform-origin:left;
          transition:transform 0.4s cubic-bezier(0.22,1,0.36,1);
          animation:barShift 4s linear infinite;
        }
        .fw:focus-within .fbar{transform:scaleX(1);}
        @keyframes barShift{0%{background-position:0% 0%}100%{background-position:200% 0%}}

        .eye-b {
          position:absolute;right:13px;top:50%;transform:translateY(-50%);
          background:none;border:none;cursor:pointer;
          color:#d4b896;display:flex;align-items:center;
          transition:color 0.2s;padding:3px;
        }
        .eye-b:hover{color:#ea580c;}

        /* Submit */
        .btn {
          width:100%;padding:0.95rem;
          background:linear-gradient(135deg,#ea580c 0%,#d97706 30%,#7c3aed 70%,#059669 100%);
          background-size:300% 300%;
          background-position:0% 50%;
          border:none;border-radius:14px;
          color:#fff;
          font-family:'Syne',sans-serif;
          font-size:0.78rem;font-weight:700;
          letter-spacing:0.15em;text-transform:uppercase;
          cursor:pointer;
          transition:all 0.4s;
          box-shadow:
            0 4px 16px rgba(234,88,12,0.3),
            0 1px 3px rgba(0,0,0,0.1),
            inset 0 1px 0 rgba(255,255,255,0.25);
          margin-top:0.75rem;
          position:relative;overflow:hidden;
        }
        .btn::before {
          content:'';position:absolute;
          top:0;left:-100%;width:50%;height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent);
          transition:left 0.55s;
        }
        .btn:hover::before{left:160%;}
        .btn:hover{
          background-position:100% 50%;
          box-shadow:0 8px 30px rgba(234,88,12,0.4),0 2px 8px rgba(0,0,0,0.1);
          transform:translateY(-2px);
        }
        .btn:active{transform:translateY(0);}
        .btn:disabled{opacity:0.5;cursor:not-allowed;transform:none;}

        .sp {
          width:14px;height:14px;
          border:2px solid rgba(255,255,255,0.35);
          border-top-color:#fff;border-radius:50%;
          animation:sp 0.65s linear infinite;
          display:inline-block;vertical-align:middle;margin-right:8px;
        }
        @keyframes sp{to{transform:rotate(360deg)}}

        /* Divider */
        .dv {display:flex;align-items:center;gap:1rem;margin:1.75rem 0 1.25rem;}
        .dl {flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(200,150,100,0.25),transparent);}
        .dt {font-size:0.62rem;color:#b89070;letter-spacing:0.14em;text-transform:uppercase;white-space:nowrap;font-weight:600;}

        .rl{text-align:center;font-size:0.83rem;color:#b89070;}
        .rl a{
          background:linear-gradient(135deg,#ea580c,#7c3aed);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;
          background-clip:text;
          font-weight:700;text-decoration:none;
          transition:opacity 0.2s;
        }
        .rl a:hover{opacity:0.75;}

        /* Floating colour chips in background */
        .chip {
          position:fixed;border-radius:50%;
          pointer-events:none;z-index:3;
          mix-blend-mode:multiply;
          opacity:0;
          animation:chipFloat linear infinite;
        }
        @keyframes chipFloat {
          0%{opacity:0;transform:translateY(0) scale(0.8);}
          10%{opacity:1;}
          90%{opacity:0.6;}
          100%{opacity:0;transform:translateY(-120vh) scale(1.2);}
        }
      `}</style>

      <div className="pg">
        <canvas ref={canvasRef} className="cv" />
        <div className="frost" />
        <div className="dots" />

        {/* Rising colour chips */}
        {[
          { size:14, left:'8%',  delay:0,   dur:18, bg:'#fb923c' },
          { size:9,  left:'20%', delay:3,   dur:22, bg:'#a78bfa' },
          { size:12, left:'35%', delay:7,   dur:16, bg:'#34d399' },
          { size:7,  left:'55%', delay:1,   dur:24, bg:'#60a5fa' },
          { size:11, left:'70%', delay:5,   dur:19, bg:'#f59e0b' },
          { size:8,  left:'85%', delay:9,   dur:21, bg:'#f472b6' },
          { size:13, left:'92%', delay:2,   dur:17, bg:'#7c3aed' },
          { size:6,  left:'45%', delay:11,  dur:20, bg:'#ea580c' },
        ].map((c,i) => (
          <div key={i} className="chip" style={{
            width:c.size, height:c.size,
            left:c.left, bottom:'-5%',
            background:c.bg,
            animationDuration:`${c.dur}s`,
            animationDelay:`${c.delay}s`,
            filter:`blur(${c.size > 10 ? 3 : 2}px)`,
            boxShadow:`0 0 ${c.size*2}px ${c.bg}`,
          }}/>
        ))}

        <motion.div
          className="wrap"
          initial={{ opacity:0, y:36 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.85, ease:[0.22,1,0.36,1] }}
        >
          {/* Bot */}
          <div className="bot-zone">
            <div className="bot-frame">
              <div className="ring ring-1"/><div className="ring ring-2"/><div className="ring ring-3"/>
              <div className="planet planet-a"/>
              <div className="planet planet-b"/>
              <div className="planet planet-c"/>

              <motion.div
                className="bot-shell"
                style={{ rotateX: (mouse.y-0.5)*10, rotateY: (mouse.x-0.5)*-10 }}
                transition={{ type:'spring', stiffness:100, damping:18 }}
              >
                <svg className="bot-svg" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Antenna */}
                  <line x1="26" y1="2" x2="26" y2="11" stroke="url(#ag)" strokeWidth="1.8" strokeLinecap="round"/>
                  <circle className="ant-pulse" cx="26" cy="1.5" r="2.5" fill="url(#ag)"/>
                  <circle cx="26" cy="1.5" r="1.1" fill="white" opacity="0.85"/>

                  {/* Head */}
                  <rect x="8" y="11" width="36" height="25" rx="9" fill="url(#hd)" stroke="url(#hs)" strokeWidth="1.2"/>
                  {/* Forehead glare */}
                  <rect x="10" y="12.5" width="15" height="5" rx="2.5" fill="white" opacity="0.2"/>

                  {/* Eyes */}
                  <g className="bot-eyes">
                    {/* L outer */}
                    <rect x="13" y="19" width="9" height="9" rx="3" fill="url(#eo)" stroke="rgba(251,146,60,0.4)" strokeWidth="0.8"/>
                    {/* L screen */}
                    <rect x="14.5" y="20.5" width="6" height="6" rx="2" fill="url(#ei)"/>
                    {/* L pupil */}
                    <circle cx="17.5" cy="23.5" r="1.6" fill="#1c0a00"/>
                    <circle cx="18.5" cy="22.5" r="0.8" fill="white" opacity="0.95"/>
                    <circle cx="16.8" cy="24.2" r="0.4" fill="white" opacity="0.5"/>

                    {/* R outer */}
                    <rect x="30" y="19" width="9" height="9" rx="3" fill="url(#eo)" stroke="rgba(124,58,237,0.4)" strokeWidth="0.8"/>
                    {/* R screen */}
                    <rect x="31.5" y="20.5" width="6" height="6" rx="2" fill="url(#ei2)"/>
                    {/* R pupil */}
                    <circle cx="34.5" cy="23.5" r="1.6" fill="#1c0a00"/>
                    <circle cx="35.5" cy="22.5" r="0.8" fill="white" opacity="0.95"/>
                    <circle cx="33.8" cy="24.2" r="0.4" fill="white" opacity="0.5"/>
                  </g>

                  {/* Nose indicator */}
                  <circle cx="26" cy="26" r="1.2" fill="rgba(234,88,12,0.3)"/>

                  {/* Smile */}
                  <path d="M18 30.5 Q26 36.5 34 30.5" stroke="url(#sm)" strokeWidth="2" strokeLinecap="round" fill="none"/>
                  <path d="M18 30.5 Q26 36.5 34 30.5" stroke="white" strokeWidth="0.6" strokeLinecap="round" fill="none" opacity="0.4"/>

                  {/* Ear L */}
                  <rect x="3.5" y="18" width="4.5" height="11" rx="2.25" fill="url(#er)" stroke="rgba(251,146,60,0.3)" strokeWidth="1"/>
                  <line x1="5.75" y1="21" x2="5.75" y2="26" stroke="rgba(251,146,60,0.6)" strokeWidth="1" strokeLinecap="round"/>

                  {/* Ear R */}
                  <rect x="44" y="18" width="4.5" height="11" rx="2.25" fill="url(#er2)" stroke="rgba(124,58,237,0.3)" strokeWidth="1"/>
                  <line x1="46.25" y1="21" x2="46.25" y2="26" stroke="rgba(124,58,237,0.6)" strokeWidth="1" strokeLinecap="round"/>

                  {/* Neck */}
                  <rect x="22" y="36" width="8" height="3.5" rx="1.75" fill="url(#nc)" stroke="rgba(251,146,60,0.2)" strokeWidth="0.8"/>

                  {/* Body */}
                  <rect x="14" y="39.5" width="24" height="10" rx="5" fill="url(#bd)" stroke="rgba(251,146,60,0.2)" strokeWidth="1"/>
                  {/* Centre button */}
                  <circle cx="26" cy="44.5" r="3.5" fill="white" stroke="rgba(251,146,60,0.3)" strokeWidth="1"/>
                  <circle cx="26" cy="44.5" r="1.8" fill="url(#bt)"/>
                  <circle cx="26" cy="44.5" r="0.7" fill="white" opacity="0.8"/>
                  {/* Side lights */}
                  <circle cx="19" cy="44.5" r="1.5" fill="rgba(251,146,60,0.25)" stroke="rgba(251,146,60,0.15)" strokeWidth="0.6"/>
                  <circle cx="33" cy="44.5" r="1.5" fill="rgba(124,58,237,0.25)" stroke="rgba(124,58,237,0.15)" strokeWidth="0.6"/>

                  <defs>
                    <linearGradient id="ag" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#fb923c"/>
                      <stop offset="100%" stopColor="#f59e0b"/>
                    </linearGradient>
                    <linearGradient id="hd" x1="8" y1="11" x2="44" y2="36" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#fff8f1"/>
                      <stop offset="100%" stopColor="#fdf4ff"/>
                    </linearGradient>
                    <linearGradient id="hs" x1="8" y1="11" x2="44" y2="36" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="rgba(251,146,60,0.35)"/>
                      <stop offset="50%" stopColor="rgba(167,139,250,0.2)"/>
                      <stop offset="100%" stopColor="rgba(52,211,153,0.25)"/>
                    </linearGradient>
                    <linearGradient id="eo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fef3c7"/>
                      <stop offset="100%" stopColor="#fde68a"/>
                    </linearGradient>
                    <linearGradient id="ei" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#fb923c"/>
                      <stop offset="100%" stopColor="#f59e0b"/>
                    </linearGradient>
                    <linearGradient id="ei2" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#a78bfa"/>
                      <stop offset="100%" stopColor="#7c3aed"/>
                    </linearGradient>
                    <linearGradient id="sm" x1="18" y1="30" x2="34" y2="30" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#fb923c"/>
                      <stop offset="50%" stopColor="#a78bfa"/>
                      <stop offset="100%" stopColor="#34d399"/>
                    </linearGradient>
                    <linearGradient id="er" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#fff7ed"/>
                      <stop offset="100%" stopColor="#fef3c7"/>
                    </linearGradient>
                    <linearGradient id="er2" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#f5f3ff"/>
                      <stop offset="100%" stopColor="#ede9fe"/>
                    </linearGradient>
                    <linearGradient id="nc" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#fde68a"/>
                      <stop offset="100%" stopColor="#ddd6fe"/>
                    </linearGradient>
                    <linearGradient id="bd" x1="14" y1="39" x2="38" y2="49" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#fff8f1"/>
                      <stop offset="100%" stopColor="#f5f3ff"/>
                    </linearGradient>
                    <linearGradient id="bt" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#fb923c"/>
                      <stop offset="100%" stopColor="#7c3aed"/>
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
            </div>

            <div className="title-block">
              <motion.h1
                className="title-main"
                initial={{ opacity:0, y:10 }}
                animate={{ opacity:1, y:0 }}
                transition={{ delay:0.22, duration:0.65 }}
              >
                College <em>AI</em> Assistant
              </motion.h1>
              <motion.p
                className="title-tag"
                initial={{ opacity:0 }}
                animate={{ opacity:1 }}
                transition={{ delay:0.4, duration:0.5 }}
              >
                Intelligent Study Companion
              </motion.p>
            </div>
          </div>

          {/* Card */}
          <motion.div
            className="card"
            initial={{ opacity:0, y:22, scale:0.97 }}
            animate={{ opacity:1, y:0, scale:1 }}
            transition={{ delay:0.3, duration:0.75, ease:[0.22,1,0.36,1] }}
          >
            <div className="cf cf-tl"/><div className="cf cf-tr"/>
            <div className="cf cf-bl"/><div className="cf cf-br"/>

            <div className="status">
              <div className="s-pip"/>
              <span className="s-txt">System Online &amp; Ready</span>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  className="err"
                  initial={{ opacity:0, y:-8, scale:0.97 }}
                  animate={{ opacity:1, y:0, scale:1 }}
                  exit={{ opacity:0, y:-8, scale:0.97 }}
                  transition={{ duration:0.22 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="13"/><circle cx="12" cy="16.5" r="0.5" fill="currentColor"/>
                  </svg>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit}>
              <div className="fg">
                <div className="fl">
                  <span className={`fl-gem ${focused==='email'?'on':''}`}/>
                  Email Address
                </div>
                <div className="fw">
                  <svg className={`fi ${focused==='email'?'on':''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input className="inp" type="email" value={email}
                    onChange={e=>setEmail(e.target.value)}
                    onFocus={()=>setFocused('email')}
                    onBlur={()=>setFocused(null)}
                    placeholder="your@university.edu" required/>
                  <div className="fbar"/>
                </div>
              </div>

              <div className="fg">
                <div className="fl">
                  <span className={`fl-gem ${focused==='pass'?'on':''}`}/>
                  Password
                </div>
                <div className="fw">
                  <svg className={`fi ${focused==='pass'?'on':''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input className="inp" type={showPassword?'text':'password'}
                    style={{ paddingRight:'2.75rem' }}
                    value={password}
                    onChange={e=>setPassword(e.target.value)}
                    onFocus={()=>setFocused('pass')}
                    onBlur={()=>setFocused(null)}
                    placeholder="••••••••" required/>
                  <button type="button" className="eye-b" onClick={()=>setShowPassword(!showPassword)} tabIndex={-1}>
                    {showPassword
                      ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                  <div className="fbar"/>
                </div>
              </div>

              <motion.button className="btn" type="submit" disabled={loading}
                whileHover={{ scale: loading?1:1.01 }}
                whileTap={{ scale: loading?1:0.98 }}
              >
                {loading ? <><span className="sp"/>Authenticating…</> : 'Sign In'}
              </motion.button>
            </form>

            <div className="dv">
              <div className="dl"/><span className="dt">New here?</span><div className="dl"/>
            </div>
            <div className="rl">
              <Link to="/register">Create an account →</Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  )
}

export default Login
