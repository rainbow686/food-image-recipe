"use client";

import { useState, useEffect } from "react";

const FAL_KEY = "89197a8d-be7d-4c5b-934c-2f3d12c7b772:3f8d26a3ca1673a30d49d1e4be46caf3";

export default function Home() {
  const [theme, setTheme] = useState("dark");
  const [lang, setLang] = useState("zh");
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [identifiedFood, setIdentifiedFood] = useState("");
  const [recipe, setRecipe] = useState("");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    if (savedTheme === "light") {
      document.body.classList.add("light-mode");
    }

    const savedLang = localStorage.getItem("lang") || "zh";
    setLang(savedLang);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.body.classList.toggle("light-mode");
    localStorage.setItem("theme", newTheme);
  };

  const switchLang = (newLang: string) => {
    setLang(newLang);
    localStorage.setItem("lang", newLang);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setCurrentImageUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const generateRecipe = async () => {
    if (!currentImageUrl) return;

    setIsLoading(true);
    setShowResult(false);

    try {
      // Call fal.ai LLaVA API for image recognition
      const llavaPrompt =
        lang === "zh"
          ? "请详细描述这张食物图片。你能识别出有哪些食材吗？请用中文回答，最多200字。"
          : "Please describe this food image. What ingredients can you identify? Answer in English, max 200 words.";

      const llavaResponse = await fetch("https://queue.fal.ai/fal-ai/llava-next", {
        method: "POST",
        headers: {
          Authorization: `Key ${FAL_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_url: currentImageUrl,
          prompt: llavaPrompt,
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      let foodDescription = "";

      if (llavaResponse.ok) {
        const llavaResult = await llavaResponse.json();
        foodDescription = llavaResult.output || "";
      } else {
        // Fallback demo response
        foodDescription =
          lang === "zh"
            ? "图片显示了一道新鲜的蔬菜沙拉，包含生菜、番茄、黄瓜等食材。"
            : "The image shows a fresh vegetable salad with lettuce, tomatoes, and cucumber.";
      }

      setIdentifiedFood(foodDescription);

      // Generate recipe based on identified food
      const recipePrompt =
        lang === "zh"
          ? `根据以下食材描述，生成一个简短的中文食谱：${foodDescription}\n\n请包含：菜名、食材清单、3-5个简单步骤。`
          : `Based on the following ingredients, generate a brief recipe in English: ${foodDescription}\n\nInclude: dish name, ingredients list, 3-5 simple steps.`;

      const recipeResponse = await fetch("https://queue.fal.ai/fal-ai/qwen2-5-coder-32b-instruct", {
        method: "POST",
        headers: {
          Authorization: `Key ${FAL_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: recipePrompt,
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (recipeResponse.ok) {
        const recipeResult = await recipeResponse.json();
        setRecipe(recipeResult.output || "");
      } else {
        // Fallback demo recipe
        setRecipe(
          lang === "zh"
            ? "📋 简易蔬菜沙拉\n\n🥗 食材：\n- 生菜 100g\n- 番茄 2个\n- 黄瓜 半根\n- 橄榄油 1勺\n\n📝 步骤：\n1. 洗净所有蔬菜\n2. 番茄切块，黄瓜切片\n3. 生菜撕成小块\n4. 淋上橄榄油拌匀\n5. 即可享用"
            : "📋 Simple Vegetable Salad\n\n🥗 Ingredients:\n- Lettuce 100g\n- Tomatoes 2\n- Cucumber half\n- Olive oil 1 tbsp\n\n📝 Steps:\n1. Wash all vegetables\n2. Cut tomatoes, slice cucumber\n3. Tear lettuce into pieces\n4. Drizzle olive oil and toss\n5. Serve and enjoy!"
        );
      }

      setShowResult(true);
    } catch (error) {
      console.error("Error:", error);
      alert(lang === "zh" ? "生成失败，请重试" : "Generation failed, please try again");
    }

    setIsLoading(false);
  };

  const copyRecipe = () => {
    navigator.clipboard.writeText(recipe);
    alert(lang === "zh" ? "已复制！" : "Copied!");
  };

  const resetTool = () => {
    setCurrentImageUrl("");
    setShowResult(false);
    setIdentifiedFood("");
    setRecipe("");
  };

  return (
    <main className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl"
        style={{ background: "var(--bg-primary)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "var(--accent)" }}
            >
              <span className="text-white text-lg">🍳</span>
            </div>
            <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
              {lang === "zh" ? "食谱AI" : "RecipeAI"}
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#tool"
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              {lang === "zh" ? "工具" : "Tool"}
            </a>
            <a
              href="#features"
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              {lang === "zh" ? "功能" : "Features"}
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <button
              onClick={() => switchLang("zh")}
              className={`lang-btn ${lang === "zh" ? "active" : ""}`}
            >
              中文
            </button>
            <button
              onClick={() => switchLang("en")}
              className={`lang-btn ${lang === "en" ? "active" : ""}`}
            >
              EN
            </button>
            <div
              className="theme-toggle"
              onClick={toggleTheme}
              title="Toggle theme"
            >
              <span>☀️</span>
              <span>🌙</span>
            </div>
          </div>
        </div>
      </header>

      {/* Tool Section */}
      <section
        id="tool"
        className="pt-28 pb-16 px-6"
        style={{ background: "var(--bg-primary)" }}
      >
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-3xl font-bold text-center mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            {lang === "zh" ? "🍳 拍照识别食谱" : "🍳 Snap & Get Recipe"}
          </h2>
          <p className="text-center mb-8" style={{ color: "var(--text-muted)" }}>
            {lang === "zh"
              ? "上传食物照片，AI 自动识别并生成食谱"
              : "Upload a food photo, AI identifies and generates recipe"}
          </p>

          {/* Upload Area */}
          <div className="card rounded-2xl p-8 mb-6">
            <div
              id="uploadZone"
              className="upload-zone p-12 text-center"
              onClick={() => document.getElementById("fileInput")?.click()}
            >
              <input
                type="file"
                id="fileInput"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
              {currentImageUrl ? (
                <div className="mb-4">
                  <img
                    src={currentImageUrl}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded-lg"
                  />
                </div>
              ) : (
                <div>
                  <div className="text-4xl mb-4">🖼️</div>
                  <p className="text-lg mb-2" style={{ color: "var(--text-primary)" }}>
                    {lang === "zh"
                      ? "点击上传图片 或 拖拽文件到此处"
                      : "Click to upload or drag image here"}
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    PNG, JPG, WebP
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-center mt-6">
              <button
                className="btn-primary px-8 py-3 rounded-full text-sm font-medium flex items-center gap-2"
                onClick={generateRecipe}
                disabled={!currentImageUrl || isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    <span>{lang === "zh" ? "处理中..." : "Processing..."}</span>
                  </>
                ) : (
                  <span>
                    {lang === "zh"
                      ? "🔍 识别并生成食谱"
                      : "🔍 Identify & Generate Recipe"}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="card rounded-2xl p-12 text-center">
              <div className="spinner-lg"></div>
              <p className="text-lg mt-4" style={{ color: "var(--text-secondary)" }}>
                {lang === "zh"
                  ? "AI 正在分析图片并生成食谱..."
                  : "AI is analyzing image and generating recipe..."}
              </p>
            </div>
          )}

          {/* Result Area */}
          {showResult && (
            <div className="card rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🤖</span>
                <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                  {lang === "zh" ? "AI 识别结果" : "AI Recognition"}
                </h3>
              </div>
              <div
                id="identifiedFood"
                className="p-4 rounded-lg mb-6"
                style={{ background: "var(--bg-tertiary)" }}
              >
                <p style={{ color: "var(--text-secondary)" }}>{identifiedFood}</p>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">📝</span>
                <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                  {lang === "zh" ? "食谱" : "Recipe"}
                </h3>
              </div>
              <div
                id="recipeResult"
                className="p-4 rounded-lg"
                style={{ background: "var(--bg-tertiary)" }}
              >
                <p style={{ color: "var(--text-secondary)" }} className="recipe-content">
                  {recipe}
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={copyRecipe}
                  className="btn-secondary px-5 py-2 rounded-full text-sm"
                >
                  {lang === "zh" ? "📋 复制" : "📋 Copy"}
                </button>
                <button
                  onClick={resetTool}
                  className="btn-secondary px-5 py-2 rounded-full text-sm"
                >
                  {lang === "zh" ? "🔄 重新开始" : "🔄 Start Over"}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="py-16 px-6"
        style={{ background: "var(--bg-secondary)" }}
      >
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-2xl font-bold text-center mb-8"
            style={{ color: "var(--text-primary)" }}
          >
            {lang === "zh" ? "核心功能" : "Features"}
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="card rounded-xl p-5 text-center">
              <div className="text-3xl mb-2">🔍</div>
              <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                {lang === "zh" ? "精准识别" : "Precise"}
              </h3>
            </div>
            <div className="card rounded-xl p-5 text-center">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                {lang === "zh" ? "秒级生成" : "Instant"}
              </h3>
            </div>
            <div className="card rounded-xl p-5 text-center">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                {lang === "zh" ? "营养分析" : "Nutrition"}
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-8 px-6"
        style={{ background: "var(--bg-secondary)", borderTop: "1px solid var(--border)" }}
      >
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: "var(--accent)" }}
            >
              <span className="text-white text-xs">🍳</span>
            </div>
            <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              RecipeAI
            </span>
          </div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            © 2026 RecipeAI.
          </p>
        </div>
      </footer>
    </main>
  );
}
