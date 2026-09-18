let mode="",pool=[],idx=0,score=0,answered=false,exam=false,timer=null,examEnd=0;
let wrong=JSON.parse(localStorage.getItem("wrongQuestions")||"[]"),favorites=JSON.parse(localStorage.getItem("favoriteQuestions")||"[]");
let stats=JSON.parse(localStorage.getItem("quizStats")||'{"answered":0,"correct":0,"exams":0}');
const $=id=>document.getElementById(id);
function save(){localStorage.setItem("wrongQuestions",JSON.stringify(wrong));localStorage.setItem("favoriteQuestions",JSON.stringify(favorites));localStorage.setItem("quizStats",JSON.stringify(stats))}
function show(id){document.querySelectorAll(".screen").forEach(x=>x.classList.remove("active"));$(id).classList.add("active");scrollTo(0,0)}
function goHome(){clearInterval(timer);show("home")}
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
function startPractice(random){clearInterval(timer);exam=false;mode=random?"随机练习":"顺序练习";pool=random?shuffle(QUESTIONS):[...QUESTIONS];idx=0;score=0;show("quiz");renderQuestion()}
function startExam(){clearInterval(timer);exam=true;mode="20题模拟考试";pool=shuffle(QUESTIONS).slice(0,20);idx=0;score=0;examEnd=Date.now()+3600000;show("quiz");renderQuestion();timer=setInterval(updateTimer,1000)}
function updateTimer(){if(!exam)return;let left=Math.max(0,examEnd-Date.now()),sec=Math.floor(left/1000),m=Math.floor(sec/60),s=sec%60;$("modeLabel").textContent=`${mode} · ${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;if(left<=0){clearInterval(timer);finish()}}
function renderQuestion(){
  answered=false;
  let q=pool[idx];
  $("modeLabel").textContent=mode;
  $("qid").textContent=`第 ${q.id} 题`;
  $("question").textContent=q.question;
  $("progressText").textContent=`${idx+1} / ${pool.length}`;
  $("progressBar").style.width=((idx+1)/pool.length*100)+"%";
  $("feedback").className="feedback";
  $("feedback").innerHTML="";
  $("nextBtn").style.display="none";
  document.querySelectorAll(".answer").forEach(b=>b.disabled=false);
  $("favBtn").textContent=favorites.includes(q.id)?"★":"☆";
  const imgWrap=$("questionImageWrap"), img=$("questionImage"), notice=$("diagramNotice");
  if(q.image){
    img.src=new URL(q.image, document.baseURI).href;
    img.alt=`第 ${q.id} 题图示`;
    imgWrap.hidden=false;
    notice.hidden=true;
    img.onerror=()=>{imgWrap.hidden=true;notice.hidden=false;notice.textContent="※ 图示文件未找到，请确认 images/ 文件夹已一起上传。";};
  }else{
    img.removeAttribute("src");
    imgWrap.hidden=true;
    notice.hidden=/图|ずのように|下図|次の図|図示/.test(q.question);
  }
}
function answer(value){if(answered)return;answered=true;let q=pool[idx],ok=value===q.answer;score+=ok?1:0;stats.answered++;if(ok)stats.correct++;if(!ok&&!wrong.includes(q.id))wrong.push(q.id);save();document.querySelectorAll(".answer").forEach(b=>b.disabled=true);let f=$("feedback");f.className="feedback show "+(ok?"correct":"incorrect");f.innerHTML=ok?"✅ <b>回答正确</b>":"❌ <b>回答错误</b><br>正确答案："+(q.answer?"正しい（正确）":"間違い（错误）");$("nextBtn").style.display="block";$("nextBtn").textContent=idx===pool.length-1?"查看成绩 →":"下一题 →"}
function nextQuestion(){if(!answered)return;if(idx===pool.length-1)finish();else{idx++;renderQuestion()}}
function finish(){clearInterval(timer);show("result");let pct=Math.round(score/pool.length*100);$("score").textContent=`${score} / ${pool.length}`;$("resultTitle").textContent=exam?(pct>=70?"🎉 合格！":"📚 再练习一次"):"练习完成";$("resultText").innerHTML=exam?`得分：<b>${pct}分</b>（70分及格）<br>${pct>=70?"恭喜通过模拟考试！":"继续练习错题，争取达到70分以上。"}`:`正确率：<b>${pct}%</b>`;if(exam){stats.exams++;save()}}
function toggleFavorite(){let id=pool[idx].id,p=favorites.indexOf(id);if(p>=0)favorites.splice(p,1);else favorites.push(id);save();$("favBtn").textContent=favorites.includes(id)?"★":"☆"}
function showWrong(){show("list");$("listTitle").textContent=`错题本（${wrong.length}）`;renderList(wrong,"wrong")}
function showFavorites(){show("list");$("listTitle").textContent=`收藏题（${favorites.length}）`;renderList(favorites,"fav")}
function renderList(ids,type){
  let qs=ids.map(id=>QUESTIONS.find(q=>q.id===id)).filter(Boolean);
  if(!qs.length){$("listBody").innerHTML='<div class="card center">这里还没有题目。</div>';return}
  $("listBody").innerHTML=qs.map(q=>`<div class="list-item">
    <div class="num">第 ${q.id} 题 · 正确答案：${q.answer?"正しい":"間違い"}</div>
    <div class="q">${esc(q.question)}</div>
    ${q.image?`<img class="list-image" src="${esc(q.image)}" alt="第${q.id}题图示" onclick="openImage(this.src)" onerror="this.style.display='none'">`:""}
    <button class="smallbtn" onclick="practiceOne(${q.id})">立即练习</button>
    <button class="smallbtn" onclick="${type==="wrong"?`removeWrong(${q.id})`:`removeFav(${q.id})`}">${type==="wrong"?"移出错题":"取消收藏"}</button>
  </div>`).join("")
}
function practiceOne(id){clearInterval(timer);exam=false;mode="单题练习";pool=[QUESTIONS.find(q=>q.id===id)];idx=0;score=0;show("quiz");renderQuestion()}
function removeWrong(id){wrong=wrong.filter(x=>x!==id);save();showWrong()}function removeFav(id){favorites=favorites.filter(x=>x!==id);save();showFavorites()}
function showStats(){show("stats");let rate=stats.answered?Math.round(stats.correct/stats.answered*100):0;$("statsBody").innerHTML=`<h2>学习记录</h2><div class="statgrid"><div class="stat"><b>${stats.answered}</b>已答题</div><div class="stat"><b>${stats.correct}</b>答对</div><div class="stat"><b>${rate}%</b>正确率</div><div class="stat"><b>${stats.exams}</b>模拟考试</div><div class="stat"><b>${wrong.length}</b>错题</div><div class="stat"><b>${favorites.length}</b>收藏</div></div><button style="width:100%;margin-top:14px" onclick="resetStats()">清空学习记录</button>`}
function resetStats(){if(confirm("确定清空错题、收藏和学习记录吗？")){wrong=[];favorites=[];stats={answered:0,correct:0,exams:0};save();showStats()}}
function esc(s){return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}

function openImage(src){if(!src)return;$("lightboxImg").src=src;$("lightbox").classList.add("show");}
function closeImage(){$("lightbox").classList.remove("show");$("lightboxImg").removeAttribute("src");}
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeImage();});
