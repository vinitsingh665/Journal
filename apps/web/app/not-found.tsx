"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#09090b",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      color: "#f4f4f5",
      textAlign: "center"
    }}>
      <div style={{
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        width: 80,
        height: 80,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
        boxShadow: "0 0 30px rgba(239, 68, 68, 0.2)"
      }}>
        <AlertCircle size={40} color="#ef4444" />
      </div>
      
      <h1 style={{
        fontSize: 120,
        fontWeight: 800,
        margin: 0,
        lineHeight: 1,
        background: "linear-gradient(135deg, #f4f4f5 0%, #a1a1aa 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent"
      }}>
        404
      </h1>
      
      <h2 style={{
        fontSize: 24,
        fontWeight: 600,
        marginTop: 16,
        marginBottom: 8
      }}>
        Page Not Found
      </h2>
      
      <p style={{
        color: "#a1a1aa",
        maxWidth: 400,
        marginBottom: 40,
        lineHeight: 1.6
      }}>
        The page you are looking for doesn't exist or has been moved. 
        Please check the URL or navigate back to safety.
      </p>
      
      <Link href="/" style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#f4f4f5",
        color: "#09090b",
        padding: "12px 24px",
        borderRadius: 8,
        fontWeight: 600,
        textDecoration: "none",
        transition: "transform 0.2s, opacity 0.2s"
      }}>
        <ArrowLeft size={18} />
        Return to Dashboard
      </Link>
    </div>
  );
}
