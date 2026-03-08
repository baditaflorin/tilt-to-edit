var TiltToEdit=(function(C){"use strict";var St=Object.defineProperty;var wt=(C,w,I)=>w in C?St(C,w,{enumerable:!0,configurable:!0,writable:!0,value:I}):C[w]=I;var S=(C,w,I)=>wt(C,typeof w!="symbol"?w+"":w,I);function w(e,t,n){return{code:e,message:t,detail:n}}function I(e){const t=e.document,n=t.permissionsPolicy??t.featurePolicy;if(typeof(n==null?void 0:n.allowsFeature)!="function")return null;const i=n.allowsFeature("accelerometer"),r=n.allowsFeature("gyroscope");return i&&r?null:w("permissions-policy","Tilt input is blocked by the current permissions policy.","Enable accelerometer and gyroscope access for this origin or iframe.")}class Q{constructor(t={}){S(this,"name","device-orientation");S(this,"listeners",new Set);S(this,"now");S(this,"windowObject");S(this,"eventHandler");this.windowObject=t.window,this.now=t.now??(()=>Date.now())}getWindowObject(){if(this.windowObject)return this.windowObject;if(typeof window<"u")return window}getRequestableConstructor(){const t=this.getWindowObject();return t==null?void 0:t.DeviceOrientationEvent}getPermissionRequester(){const t=this.getWindowObject(),n=this.getRequestableConstructor();return typeof(n==null?void 0:n.requestPermission)=="function"?n:t==null?void 0:t.DeviceMotionEvent}supportsOrientationEvents(){const t=this.getWindowObject();return t?this.getRequestableConstructor()?!0:"ondeviceorientation"in t||"ondeviceorientationabsolute"in t:!1}getAvailability(){var i;const t=this.getWindowObject();if(!t)return{supported:!1,permissionRequired:!1,blockedDiagnostic:w("unsupported-api","Tilt input is not available outside a browser window.")};if(!t.isSecureContext)return{supported:!0,permissionRequired:!1,blockedDiagnostic:w("insecure-context","Tilt input requires a secure context.","Serve the app over HTTPS or localhost.")};const n=I(t);return n?{supported:!0,permissionRequired:!1,blockedDiagnostic:n}:this.supportsOrientationEvents()?{supported:!0,permissionRequired:typeof((i=this.getPermissionRequester())==null?void 0:i.requestPermission)=="function"}:{supported:!1,permissionRequired:!1,blockedDiagnostic:w("unsupported-api","DeviceOrientationEvent is not supported in this browser.")}}async requestPermission(){const t=this.getPermissionRequester();if(!(t!=null&&t.requestPermission))return"granted";try{return await t.requestPermission()}catch{return"denied"}}subscribe(t){return this.listeners.add(t),this.ensureListener(),()=>{this.listeners.delete(t),this.listeners.size===0&&this.teardownListener()}}ensureListener(){if(this.eventHandler)return;const t=this.getWindowObject();t&&(this.eventHandler=n=>{if(n.beta==null||n.gamma==null)return;const i={alpha:n.alpha,beta:n.beta,gamma:n.gamma,absolute:n.absolute,timestamp:this.now()};for(const r of this.listeners)try{r.onSample(i)}catch(s){const a=s instanceof Error?s:new Error(String(s));r.onError(a)}},t.addEventListener("deviceorientation",this.eventHandler))}teardownListener(){const t=this.getWindowObject();!t||!this.eventHandler||(t.removeEventListener("deviceorientation",this.eventHandler),this.eventHandler=void 0)}}function X(e={}){return new Q(e)}function V(e=0,t=0){return{x:e,y:t,magnitude:Math.hypot(e,t)}}function Y(e,t,n){return Math.min(Math.max(e,t),n)}function tt(e){const t=(Math.round(e/90)*90%360+360)%360;return t===0||t===90||t===180||t===270?t:0}function et(){if(typeof window>"u")return 0;const e=window.screen.orientation;if(typeof(e==null?void 0:e.angle)=="number")return e.angle;const t=window.orientation;return typeof t=="number"?t:0}function _(e,t,n){switch(tt(n)){case 90:return{x:-e,y:t};case 180:return{x:-t,y:-e};case 270:return{x:e,y:-t};default:return{x:t,y:e}}}function U(e,t,n){const i=Math.abs(e);if(i<=t)return 0;const r=Math.max(n,t+1),s=(i-t)/Math.max(r-t,1);return Y(s,0,1)*Math.sign(e)}function K(e,t,n){const i=Y(n,0,1);return i===0?t:e+(t-e)*i}function F(e,t,n){return{code:e,message:t,detail:n}}class nt{constructor(t={}){S(this,"listeners",new Set);S(this,"options");S(this,"backend");S(this,"stepState",{x:{lastDirection:0,lastEmitAt:-1/0,sequence:0},y:{lastDirection:0,lastEmitAt:-1/0,sequence:0}});S(this,"snapshot");S(this,"calibration",null);S(this,"unsubscribeBackend",null);this.backend=t.backend??X(),this.options={axisMode:t.axisMode??"both",deadZone:t.deadZone??5,hysteresis:t.hysteresis??2,stepThreshold:t.stepThreshold??12,repeatIntervalMs:t.repeatIntervalMs??160,continuousRange:t.continuousRange??30,smoothing:t.smoothing??.3,autoCalibrateOnStart:t.autoCalibrateOnStart??!0,initialArmed:t.initialArmed??!1,requireArmedForStep:t.requireArmedForStep??!1,screenOrientationProvider:t.screenOrientationProvider??et,now:t.now??(()=>Date.now())};const n=this.backend.getAvailability(),i=this.deriveInitialStatus(n),r=n.permissionRequired?"unknown":"not-required";this.snapshot={status:i,backend:this.backend.name,permissionState:r,armed:this.options.initialArmed,calibrated:!1,diagnostics:n.blockedDiagnostic?[n.blockedDiagnostic]:n.permissionRequired?[F("permission-required","Tilt permission must be requested from a user gesture.")]:[],calibration:null,rawVector:V(),intentVector:V(),stepEvents:{x:{direction:0,sequence:0,timestamp:null},y:{direction:0,sequence:0,timestamp:null}},lastSample:null,lastConfirmationAt:null,confirmationSequence:0}}deriveInitialStatus(t){return t.supported?t.blockedDiagnostic?"blocked":t.permissionRequired?"needs-permission":"paused":"unsupported"}getSnapshot(){return this.snapshot}subscribe(t){return this.listeners.add(t),()=>{this.listeners.delete(t)}}emitSnapshot(){for(const t of this.listeners)t(this.snapshot)}updateSnapshot(t){this.snapshot={...this.snapshot,...t},this.emitSnapshot()}async start(){if(this.unsubscribeBackend)return this.snapshot;const t=this.backend.getAvailability();return t.supported?t.blockedDiagnostic?(this.updateSnapshot({status:"blocked",diagnostics:[t.blockedDiagnostic]}),this.snapshot):t.permissionRequired&&this.snapshot.permissionState!=="granted"?(this.updateSnapshot({status:"needs-permission",diagnostics:[F("permission-required","Tilt permission must be requested from a user gesture.")]}),this.snapshot):(this.unsubscribeBackend=this.backend.subscribe({onSample:n=>{this.processSample(n)},onError:n=>{this.handleBackendError(n)}}),this.updateSnapshot({status:"active",diagnostics:[]}),this.snapshot):(this.updateSnapshot({status:"unsupported",diagnostics:t.blockedDiagnostic?[t.blockedDiagnostic]:this.snapshot.diagnostics}),this.snapshot)}async requestPermission(){return this.backend.requestPermission?await this.backend.requestPermission()==="granted"?(this.updateSnapshot({permissionState:"granted",diagnostics:[],status:"paused"}),this.start()):(this.updateSnapshot({permissionState:"denied",status:"blocked",diagnostics:[F("permission-denied","Tilt permission was denied by the browser.")]}),this.snapshot):(this.updateSnapshot({permissionState:"not-required"}),this.start())}pause(){return this.unsubscribeBackend&&(this.unsubscribeBackend(),this.unsubscribeBackend=null),this.snapshot.status==="unsupported"||this.snapshot.status==="blocked"?this.snapshot:(this.updateSnapshot({status:"paused"}),this.snapshot)}resume(){return this.start()}calibrate(t=this.snapshot.lastSample){return t?(this.calibration={alpha:t.alpha,beta:t.beta,gamma:t.gamma,timestamp:t.timestamp},this.resetStepState(),this.updateSnapshot({calibrated:!0,calibration:this.calibration,rawVector:V(),intentVector:V(),stepEvents:{x:{...this.snapshot.stepEvents.x,direction:0},y:{...this.snapshot.stepEvents.y,direction:0}}}),!0):!1}confirm(){return this.updateSnapshot({confirmationSequence:this.snapshot.confirmationSequence+1,lastConfirmationAt:this.options.now()}),this.snapshot}setArmed(t){return this.updateSnapshot({armed:t}),this.snapshot}destroy(){this.pause(),this.listeners.clear()}resetStepState(){this.stepState.x={lastDirection:0,lastEmitAt:-1/0,sequence:0},this.stepState.y={lastDirection:0,lastEmitAt:-1/0,sequence:0}}handleBackendError(t){this.updateSnapshot({status:"error",diagnostics:[F("backend-error","Tilt input failed while reading the sensor backend.",t.message)]})}processSample(t){!this.calibration&&this.options.autoCalibrateOnStart&&(this.calibration={alpha:t.alpha,beta:t.beta,gamma:t.gamma,timestamp:t.timestamp});const n=this.options.screenOrientationProvider(),i=_(t.beta,t.gamma,n),r=this.calibration?_(this.calibration.beta,this.calibration.gamma,n):{x:0,y:0};let s=i.x-r.x,a=i.y-r.y;this.options.axisMode==="horizontal"?a=0:this.options.axisMode==="vertical"&&(s=0);const o=K(this.snapshot.rawVector.x,s,this.options.smoothing),u=K(this.snapshot.rawVector.y,a,this.options.smoothing),p=V(o,u),x=V(U(o,this.options.deadZone,this.options.continuousRange),U(u,this.options.deadZone,this.options.continuousRange)),l={x:this.computeStepEvent("x",o),y:this.computeStepEvent("y",u)};this.updateSnapshot({status:this.snapshot.status==="paused"?"paused":"active",calibrated:this.calibration!==null,calibration:this.calibration,rawVector:p,intentVector:x,stepEvents:l,lastSample:t})}computeStepEvent(t,n){const i=this.stepState[t],r=this.options.now(),s=Math.max(this.options.stepThreshold-this.options.hysteresis,0);let a=0;Math.abs(n)>=this.options.stepThreshold?a=n>0?1:-1:Math.abs(n)<=s&&(i.lastDirection=0),this.options.requireArmedForStep&&!this.snapshot.armed&&(a=0);const o=a!==0&&a!==i.lastDirection,u=a!==0&&r-i.lastEmitAt>=this.options.repeatIntervalMs;return a!==0&&(o||u)?(i.lastDirection=a,i.lastEmitAt=r,i.sequence+=1,{direction:a,sequence:i.sequence,timestamp:r}):{direction:0,sequence:i.sequence,timestamp:this.snapshot.stepEvents[t].timestamp}}}function it(e={}){return new nt(e)}const st="0.3.0",Z="[data-tilt-to-edit]",rt=["Brightness","Contrast","Theme","Focus mode","Volume"],at=`
:host {
  all: initial;
}

.tte-shell,
.tte-shell * {
  box-sizing: border-box;
}

.tte-shell {
  font-family: "Avenir Next", "Trebuchet MS", sans-serif;
  color: #f8fafc;
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background:
    radial-gradient(circle at top left, rgba(251, 191, 36, 0.18), transparent 32%),
    radial-gradient(circle at top right, rgba(45, 212, 191, 0.18), transparent 28%),
    linear-gradient(155deg, rgba(7, 17, 31, 0.96), rgba(28, 17, 46, 0.92));
  box-shadow: 0 24px 62px rgba(6, 10, 22, 0.36);
  padding: 1.2rem;
}

.tte-head {
  display: flex;
  gap: 0.9rem;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.tte-kicker {
  margin: 0 0 0.35rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 0.73rem;
  color: #fbbf24;
}

.tte-title {
  margin: 0;
  font-size: 1.35rem;
  color: #fff7ed;
}

.tte-copy {
  margin: 0.35rem 0 0;
  color: rgba(226, 232, 240, 0.76);
  line-height: 1.5;
}

.tte-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 112px;
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.08);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.72rem;
  color: #fde68a;
}

.tte-status[data-state="blocked"],
.tte-status[data-state="unsupported"],
.tte-status[data-state="error"] {
  color: #fecaca;
}

.tte-status[data-state="needs-permission"],
.tte-status[data-state="paused"] {
  color: #bfdbfe;
}

.tte-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
}

.tte-metric {
  padding: 0.8rem 0.9rem;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.tte-metric-label {
  display: block;
  color: rgba(226, 232, 240, 0.64);
  font-size: 0.78rem;
}

.tte-metric-value {
  display: block;
  margin-top: 0.22rem;
  color: #fff7ed;
  font-weight: 700;
}

.tte-stage {
  margin-top: 1rem;
}

.tte-vector-pad {
  position: relative;
  min-height: 220px;
  overflow: hidden;
  border-radius: 24px;
  background:
    radial-gradient(circle at 50% 16%, rgba(34, 211, 238, 0.24), transparent 34%),
    linear-gradient(180deg, rgba(12, 33, 64, 0.92), rgba(15, 23, 42, 0.8));
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.tte-vector-grid {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 28px 28px;
  opacity: 0.34;
}

.tte-vector-axis {
  position: absolute;
  background: rgba(255, 255, 255, 0.14);
}

.tte-vector-axis-x {
  left: 16px;
  right: 16px;
  top: 50%;
  height: 1px;
}

.tte-vector-axis-y {
  top: 16px;
  bottom: 16px;
  left: 50%;
  width: 1px;
}

.tte-vector-orb {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 22px;
  height: 22px;
  margin-left: -11px;
  margin-top: -11px;
  border-radius: 999px;
  background: #67e8f9;
  box-shadow: 0 0 22px rgba(34, 211, 238, 0.88), 0 0 44px rgba(45, 212, 191, 0.44);
  transition: transform 140ms ease;
}

.tte-vector-label {
  position: absolute;
  font-size: 0.76rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.46);
}

.tte-vector-label-x {
  right: 18px;
  bottom: 16px;
}

.tte-vector-label-y {
  left: 18px;
  top: 18px;
}

.tte-number-stage {
  padding: 1rem;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
}

.tte-number-value {
  margin: 0;
  font-size: clamp(2.2rem, 7vw, 3.3rem);
  line-height: 1;
  color: #fff7ed;
}

.tte-number-copy {
  margin: 0.35rem 0 0;
  color: rgba(226, 232, 240, 0.72);
}

.tte-track {
  position: relative;
  height: 10px;
  border-radius: 999px;
  margin-top: 1rem;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
}

.tte-track-fill {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: inherit;
  background: linear-gradient(90deg, #2dd4bf, #fbbf24);
  box-shadow: 0 0 24px rgba(45, 212, 191, 0.3);
}

.tte-slider {
  width: 100%;
  margin-top: 1rem;
  accent-color: #fbbf24;
}

.tte-menu-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.7rem;
}

.tte-menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(248, 250, 252, 0.92);
  transition: transform 140ms ease, border-color 140ms ease, background 140ms ease;
}

.tte-menu-item[data-highlighted="true"] {
  border-color: rgba(251, 191, 36, 0.62);
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(255, 255, 255, 0.1));
  transform: translateY(-1px);
}

.tte-menu-item[data-selected="true"] .tte-menu-state {
  color: #fbbf24;
}

.tte-menu-label {
  font-weight: 600;
}

.tte-menu-state {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.44);
}

.tte-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
}

.tte-button {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.08));
  color: #fff7ed;
  padding: 0.72rem 1rem;
  cursor: pointer;
  box-shadow: 0 18px 38px rgba(8, 15, 28, 0.24);
}

.tte-button[data-variant="primary"] {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.38), rgba(45, 212, 191, 0.22));
}

.tte-button[hidden] {
  display: none;
}

.tte-diagnostics {
  margin: 1rem 0 0;
  padding-left: 1.2rem;
  color: #fed7aa;
}

@media (max-width: 720px) {
  .tte-shell {
    padding: 1rem;
  }

  .tte-head {
    flex-direction: column;
  }
}
`,j=X(),N=new WeakMap,W=new Set;function L(e,t,n){return Math.min(n,Math.max(t,e))}function ot(e,t){return t===0?0:L(e,0,t-1)}function ct(e){return e==="sensor"||e==="stepper"||e==="slider"||e==="menu"?e:null}function dt(e){const t=e==null?void 0:e.split("|").map(n=>n.trim()).filter(Boolean);return t&&t.length>0?t:rt}function O(e,t){if(!e)return t;const n=Number(e);return Number.isFinite(n)?n:t}function R(e){switch(e){case"needs-permission":return"needs permission";default:return e}}function c(e,t,n){const i=document.createElement(e);return t&&(i.className=t),n!==void 0&&(i.textContent=n),i}function f(e){const t=c("div","tte-metric"),n=c("span","tte-metric-label",e),i=c("strong","tte-metric-value");return t.append(n,i),{root:t,value:i}}function T(e,t="default"){const n=c("button","tte-button",e);return n.type="button",t==="primary"&&(n.dataset.variant="primary"),n}function ut(e,t){e.replaceChildren();const n=document.createElement("style");n.textContent=at;const i=c("article","tte-shell"),r=c("header","tte-head"),s=c("div"),a=c("p","tte-kicker",t.kind==="sensor"?"Script Tag Sensor":t.kind==="menu"?"Hybrid Menu":t.kind==="slider"?"Continuous Control":"Discrete Control"),o=c("h2","tte-title",t.title),u=c("p","tte-copy",t.description),p=c("strong","tte-status","paused");s.append(a,o,u),r.append(s,p);const x=c("div","tte-metrics"),l=c("div","tte-stage"),m=c("div","tte-actions"),y=c("div","tte-actions"),v=c("ul","tte-diagnostics"),h=T("Enable tilt","primary"),E=T("Calibrate"),q=T("Pause");return m.append(h,E,q),i.append(r,x,l,m,y,v),e.append(n,i),{shell:i,status:p,stage:l,diagnostics:v,primaryActions:m,secondaryActions:y,requestPermissionButton:h,calibrateButton:E,pauseButton:q,metrics:x}}function lt(e){if(typeof e!="string")return e;const t=document.querySelector(e);if(!t)throw new Error(`Unable to find tilt embed target: ${e}`);return t}function pt(e,t={}){const n=ct(e.dataset.tiltToEdit??e.dataset.tiltType),i=t.kind??n??"sensor",r={sensor:{title:"Tilt Sensor",description:"This widget exposes live tilt intent so the host page can react with any motion-driven experience."},stepper:{title:"Tilt Stepper",description:"Lean left and right to nudge a draft value, then confirm explicitly."},slider:{title:"Tilt Slider",description:"Use tilt as a soft analog input, then confirm when the preview lands where you want it."},menu:{title:"Tilt Menu",description:"Tilt up and down to browse. Lean right to commit. Lean left to restore the current selection."}}[i],s=t.items??dt(e.dataset.tiltItems),a=t.min??O(e.dataset.tiltMin,0),o=t.max??O(e.dataset.tiltMax,100),u=t.value??O(e.dataset.tiltValue,42),p=ot(t.selectedIndex??O(e.dataset.tiltSelectedIndex,0),s.length);return{kind:i,title:t.title??e.dataset.tiltTitle??r.title,description:t.description??e.dataset.tiltDescription??r.description,items:s,selectedIndex:p,min:a,max:o,value:L(u,a,o),step:Math.max(t.step??O(e.dataset.tiltStep,1),1),sensitivity:Math.max(t.sensitivity??O(e.dataset.tiltSensitivity,o-a),1),stepThreshold:Math.max(t.stepThreshold??O(e.dataset.tiltStepThreshold,i==="menu"?8:6),1),backend:t.backend,autoStart:t.autoStart??!0,onState:t.onState,onChange:t.onChange,onCommit:t.onCommit}}function mt(e){switch(e.kind){case"slider":return{backend:e.backend??j,axisMode:"horizontal",smoothing:.75};case"stepper":return{backend:e.backend??j,axisMode:"horizontal",smoothing:.75,stepThreshold:e.stepThreshold};case"menu":return{backend:e.backend??j,axisMode:"both",smoothing:.72,stepThreshold:e.stepThreshold};default:return{backend:e.backend??j,axisMode:"both",deadZone:2,smoothing:.72,continuousRange:20}}}function D(e,t,n,i){i==null||i(n),e.dispatchEvent(new CustomEvent(`tilt-to-edit:${t}`,{detail:n,bubbles:!0,composed:!0}))}function H(e,t){e.status.textContent=R(t.status),e.status.dataset.state=t.status,e.requestPermissionButton.hidden=t.status!=="needs-permission",e.pauseButton.textContent=t.status==="active"?"Pause":"Resume",e.pauseButton.disabled=t.status==="blocked"||t.status==="unsupported"||t.status==="error",e.diagnostics.replaceChildren();for(const n of t.diagnostics){const i=c("li",void 0,n.message);e.diagnostics.append(i)}}function ht(e,t,n,i){const r=f("Status"),s=f("Intent X"),a=f("Intent Y"),o=f("Confirmations");n.metrics.append(r.root,s.root,a.root,o.root);const u=c("div","tte-vector-pad"),p=c("div","tte-vector-grid"),x=c("div","tte-vector-axis tte-vector-axis-x"),l=c("div","tte-vector-axis tte-vector-axis-y"),m=c("div","tte-vector-orb"),y=c("span","tte-vector-label tte-vector-label-x","X axis"),v=c("span","tte-vector-label tte-vector-label-y","Y axis");return u.append(p,x,l,m,y,v),n.stage.append(u),{update(h){H(n,h),r.value.textContent=R(h.status),s.value.textContent=h.intentVector.x.toFixed(2),a.value.textContent=h.intentVector.y.toFixed(2),o.value.textContent=String(h.confirmationSequence),m.style.transform=`translate(${h.intentVector.x*68}px, ${h.intentVector.y*-56}px)`},buildDetail(h){return{kind:"sensor",snapshot:h}},confirm(){return t.confirm()},destroy(){}}}function bt(e,t,n,i){let r=i.value,s=i.value,a=t.getSnapshot().stepEvents.x.sequence;const o=f("Status"),u=f("Committed"),p=f("Draft"),x=f("Intent X");n.metrics.append(o.root,u.root,p.root,x.root);const l=c("div","tte-number-stage"),m=c("p","tte-number-value"),y=c("p","tte-number-copy","Discrete tilt steps update the draft. Commit when it feels right."),v=c("div","tte-track"),h=c("div","tte-track-fill");v.append(h),l.append(m,y,v),n.stage.append(l);const E=T("Reset draft"),q=T("Confirm","primary");n.secondaryActions.append(E,q);const A=b=>{H(n,b),o.value.textContent=R(b.status),u.value.textContent=r.toFixed(0),p.value.textContent=s.toFixed(0),x.value.textContent=b.intentVector.x.toFixed(2),m.textContent=s.toFixed(0),h.style.width=`${(s-i.min)/Math.max(i.max-i.min,1)*100}%`},g=b=>{D(e,"change",{kind:"stepper",snapshot:b,committedValue:r,draftValue:s},i.onChange)},M=b=>{r=s;const B=t.confirm();return A(B),D(e,"commit",{kind:"stepper",snapshot:B,committedValue:r,draftValue:s},i.onCommit),B};return E.addEventListener("click",()=>{s=r,A(t.getSnapshot()),g(t.getSnapshot())}),q.addEventListener("click",()=>{M()}),{update(b){b.stepEvents.x.sequence!==a&&b.stepEvents.x.direction!==0?(a=b.stepEvents.x.sequence,s=L(s+b.stepEvents.x.direction*i.step,i.min,i.max),g(b)):a=b.stepEvents.x.sequence,A(b)},buildDetail(b){return{kind:"stepper",snapshot:b,committedValue:r,draftValue:s}},confirm(){return M()},destroy(){}}}function gt(e,t,n,i){let r=i.value,s=i.value,a=Number.NaN;const o=f("Status"),u=f("Committed"),p=f("Draft"),x=f("Intent X");n.metrics.append(o.root,u.root,p.root,x.root);const l=c("div","tte-number-stage"),m=c("p","tte-number-value"),y=c("p","tte-number-copy","Continuous tilt previews the value before you commit it."),v=c("input","tte-slider");v.type="range",v.readOnly=!0,v.min=String(i.min),v.max=String(i.max),l.append(m,y,v),n.stage.append(l);const h=T("Confirm","primary");n.secondaryActions.append(h);const E=g=>{H(n,g),o.value.textContent=R(g.status),u.value.textContent=r.toFixed(2),p.value.textContent=s.toFixed(2),x.value.textContent=g.intentVector.x.toFixed(2),m.textContent=s.toFixed(2),v.value=String(s)},q=g=>{D(e,"change",{kind:"slider",snapshot:g,committedValue:r,draftValue:s},i.onChange)},A=g=>{r=s;const M=t.confirm();return E(M),D(e,"commit",{kind:"slider",snapshot:M,committedValue:r,draftValue:s},i.onCommit),M};return h.addEventListener("click",()=>{A()}),{update(g){s=L(r+g.intentVector.x*i.sensitivity,i.min,i.max),Math.abs(s-a)>=.01&&(a=s,q(g)),E(g)},buildDetail(g){return{kind:"slider",snapshot:g,committedValue:r,draftValue:s}},confirm(){return A()},destroy(){}}}function ft(e,t,n,i){let r=i.selectedIndex,s=i.selectedIndex,a="idle",o=t.getSnapshot().stepEvents.y.sequence,u=t.getSnapshot().stepEvents.x.sequence;const p=f("Status"),x=f("Selected"),l=f("Highlighted"),m=f("Action"),y=f("Intent");n.metrics.append(p.root,x.root,l.root,m.root,y.root);const v=c("ol","tte-menu-list"),h=i.items.map(d=>{const k=c("li","tte-menu-item"),P=c("span","tte-menu-label",d),z=c("span","tte-menu-state");return k.append(P,z),v.append(k),{row:k,state:z,item:d}});n.stage.append(v);const E=T("Return"),q=T("Commit","primary");n.secondaryActions.append(E,q);const A=()=>{for(const[d,k]of h.entries()){const P=d===s,z=d===r;k.row.dataset.highlighted=String(P),k.row.dataset.selected=String(z),k.state.textContent=z?"Live":P?"Focus":""}},g=d=>{H(n,d),p.value.textContent=R(d.status),x.value.textContent=i.items[r]??"n/a",l.value.textContent=i.items[s]??"n/a",m.value.textContent=a==="idle"?"idle":a==="browse"?"browse":a,y.value.textContent=`${d.intentVector.x.toFixed(2)} / ${d.intentVector.y.toFixed(2)}`,A()},M=d=>{D(e,"change",{kind:"menu",snapshot:d,action:a,selectedIndex:r,highlightedIndex:s,selectedItem:i.items[r]??"",highlightedItem:i.items[s]??""},i.onChange)},b=d=>{r=s,a="committed";const k=t.confirm();g(k);const P={kind:"menu",snapshot:k,action:a,selectedIndex:r,highlightedIndex:s,selectedItem:i.items[r]??"",highlightedItem:i.items[s]??""};return D(e,"commit",P,i.onCommit),k},B=()=>{s=r,a="reverted";const d=t.getSnapshot();return g(d),M(d),d};return E.addEventListener("click",()=>{B()}),q.addEventListener("click",()=>{b()}),{update(d){d.stepEvents.y.sequence!==o&&d.stepEvents.y.direction!==0?(o=d.stepEvents.y.sequence,s=L(s+d.stepEvents.y.direction,0,i.items.length-1),a="browse",M(d)):o=d.stepEvents.y.sequence,d.stepEvents.x.sequence!==u&&d.stepEvents.x.direction!==0?(u=d.stepEvents.x.sequence,Math.abs(d.intentVector.x)>Math.abs(d.intentVector.y)+.08&&(d.stepEvents.x.direction>0?b():B())):u=d.stepEvents.x.sequence,g(d)},buildDetail(d){return{kind:"menu",snapshot:d,action:a,selectedIndex:r,highlightedIndex:s,selectedItem:i.items[r]??"",highlightedItem:i.items[s]??""}},confirm(){return b()},destroy(){}}}function xt(e,t,n,i){switch(i.kind){case"stepper":return bt(e,t,n,i);case"slider":return gt(e,t,n,i);case"menu":return ft(e,t,n,i);default:return ht(e,t,n)}}function G(e,t={}){const n=lt(e),i=N.get(n);if(i)return i;const r=pt(n,t),s=n.shadowRoot??n.attachShadow({mode:"open"}),a=ut(s,r),o=it(mt(r)),u=xt(n,o,a,r),p=m=>{const y=u.buildDetail(m);D(n,"state",y,r.onState)},x=o.subscribe(m=>{u.update(m),p(m)}),l={element:n,kind:r.kind,requestPermission:()=>o.requestPermission(),calibrate:()=>o.calibrate(),pause:()=>o.pause(),resume:()=>o.resume(),confirm:()=>u.confirm(),destroy:()=>{x(),u.destroy(),o.destroy(),s.replaceChildren(),N.delete(n),W.delete(l)},getSnapshot:()=>o.getSnapshot()};return a.requestPermissionButton.addEventListener("click",()=>{l.requestPermission()}),a.calibrateButton.addEventListener("click",()=>{l.calibrate()}),a.pauseButton.addEventListener("click",()=>{if(o.getSnapshot().status==="active"){l.pause();return}l.resume()}),N.set(n,l),W.add(l),u.update(o.getSnapshot()),p(o.getSnapshot()),D(n,"ready",u.buildDetail(o.getSnapshot())),r.autoStart&&o.start(),l}function vt(e){const t=new Set;if(e instanceof HTMLElement&&e.matches(Z)&&t.add(e),"querySelectorAll"in e)for(const n of e.querySelectorAll(Z))t.add(n);return Array.from(t)}function J(e=document,t={}){return vt(e).map(n=>G(n,{backend:t.backend,autoStart:t.autoStart}))}function yt(){return Array.from(W)}const $={version:st,mount:G,scan:J,getInstances:yt};if(typeof window<"u"){window.TiltToEdit=$;const e=()=>{J()};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",e,{once:!0}):queueMicrotask(e)}return C.TiltToEdit=$,C.default=$,Object.defineProperties(C,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}}),C})({});
