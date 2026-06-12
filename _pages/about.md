---
permalink: /
title: "About me"
excerpt: "About me"
author_profile: true
classes: home-page
redirect_from: 
  - /about/
  - /about.html
---

Hi there, I'm Zhengyang Geng, a final-year Ph.D. student advised by [Zico Kolter](https://zicokolter.com/) and working closely with [Kaiming He](https://people.csail.mit.edu/kaiming/). Previously, I worked with [Zhouchen Lin](https://zhouchenlin.github.io/) and [Shaojie Bai](https://scholar.google.com/citations?user=DLVP3PcAAAAJ&hl=en).

I am an enthusiast of dynamics, recognizing, understanding, and developing dynamics that lead to non-trivial systems. 

Research
---------

<div class="research-vision">
  <p>
  I pursue a <em>principled</em>—and, yes, playful (乐子)—understanding of intelligence. My interests are eclectic, but they converge on dynamics as the unifying language.
  </p>
  <p>
  I explore the spectrum of adaptive computation: making intelligence more accessible and efficient via selective compression, and more capable and controllable via extended compute.
  </p>
  <p>
  Beyond artificial systems, I’m interested in modeling and understanding nature through dynamics. The only constant is change; invariance under change is truth.
  </p>
</div>

<div class="research-tech">
  <div class="research-spectrum">
    <div class="research-spectrum__item">
      <h4>Towards 1-step models (compression extreme)</h4>
      <p>I study how to compress iterative algorithms into single-step inference so intelligence becomes cheaper, faster, and more widely accessible.</p>
    </div>
    <div class="research-spectrum__item">
      <h4>Towards &infin;-step models (capacity extreme)</h4>
      <p>I study neural attractors and deep equilibrium models that scale adaptive computation with problem complexity and human intention.</p>
    </div>
  </div>
</div>

<details class="research-focus-details">
  <summary>Technical Lenses</summary>
  <div class="research-coda research-coda--technical">
    <p>I believe that structured decomposition (<em>representation</em>) and reconstruction (<em>generation</em>) are key to the emergence of general intelligence, and that dynamics provide an elegant mechanism.</p>
  </div>
  <div class="research-focus">
    <div class="research-focus__item">
      <h4>Forward Pass</h4>
      <p>I study <strong>dynamical systems</strong> as both a construction method and a learning principle for neural networks.</p>
    </div>
    <div class="research-focus__item">
      <h4>Backward Pass</h4>
      <p>I investigate <strong>training dynamics</strong>: geometry, landscapes, and couplings among data/environment, model, and optimization.</p>
    </div>
  </div>
</details>

Twitter
---------

<blockquote class="twitter-note">
  <p>"There is no need to anneal down life's learning rate too early... AGI should offer people better childhood and teenage lives, not grasping people to serve and achieve itself."</p>
  <p>— <a href="https://x.com/ZhengyangGeng/status/1778672398046216314">Post on X (Apr 12, 2024)</a></p>
</blockquote>

Selected Works
---------

<details class="works-group" markdown="1">
<summary><span class="works-group__head"><span class="works-group__title">Generative Modeling</span><span class="works-group__tag">towards 1-step</span></span></summary>
<div class="works-group__content" markdown="1">

<div class="works-subgroup" markdown="1">
- One-step Latent-free Image Generation with Pixel Mean Flows <a class="pub-meta pub-meta--link" href="{{ site.baseurl }}/projects/?venue=icml">ICML</a><a class="pub-meta pub-meta--link" href="{{ site.baseurl }}/projects/?year=2026">2026</a> <br>
  Yiyang Lu\*, Susie Lu\*, Qiao Sun\*, Hanhong Zhao\*, Zhicheng Jiang, Xianbang Wang, <br>
  <span class="pub-author-continuation">Tianhong Li, <strong>Zhengyang Geng</strong>, and Kaiming He</span> <br>
  **TL;DR**: Modeling low-dim data manifold in high-dim space with Mean Flows. <br>
  [[Paper](https://arxiv.org/abs/2601.22158)] [[Code](https://github.com/Lyy-iiis/pMF)]

- Improved Mean Flows <a class="pub-meta pub-meta--link" href="{{ site.baseurl }}/projects/?venue=cvpr">CVPR</a><a class="pub-meta pub-meta--link" href="{{ site.baseurl }}/projects/?year=2026">2026</a> <span class="pub-badge pub-badge--highlight">Highlight</span> <span class="pub-badge pub-badge--compute">Compute Transparency Champion</span> <br>
  **Zhengyang Geng**\*, Yiyang Lu\*, Zongze Wu, Eli Shechtman, J. Zico Kolter, and Kaiming He <br>
  **TL;DR**: Stability, flexibility, and architecture for Mean Flows. <br>
  [[Paper](https://arxiv.org/abs/2512.02012)] [[Code](https://github.com/Lyy-iiis/imeanflow)]

- Mean Flows for One-step Generative Modeling <a class="pub-meta pub-meta--link" href="{{ site.baseurl }}/projects/?venue=neurips">NeurIPS</a><a class="pub-meta pub-meta--link" href="{{ site.baseurl }}/projects/?year=2025">2025</a> <span class="pub-badge pub-badge--oral">Oral</span> <br>
  **Zhengyang Geng**, Mingyang Deng, Xingjian Bai, J. Zico Kolter, and Kaiming He <br>
  **TL;DR**: Learning to solve generative dynamics at training time. <br>
  [[Paper](https://arxiv.org/abs/2505.13447)] [[JAX Code](https://github.com/Gsunshine/meanflow)] [[PyTorch Code](https://github.com/Gsunshine/py-meanflow )]

- Consistency Models Made Easy <a class="pub-meta pub-meta--link" href="{{ site.baseurl }}/projects/?venue=iclr">ICLR</a><a class="pub-meta pub-meta--link" href="{{ site.baseurl }}/projects/?year=2025">2025</a> <br>
  **Zhengyang Geng**, William Luo, Ashwini Pokle, and J. Zico Kolter <br>
  **TL;DR**: Easy consistency tuning through self teacher. <br>
  [[Paper](https://arxiv.org/abs/2406.14548)] [[Blog](https://gsunshine.notion.site/Consistency-Models-Made-Easy-954205c0b4a24c009f78719f43b419cc?pvs=4)] [[Code](https://github.com/locuslab/ect)] [[BibTeX](/assets/bib/ect.bib)]

- 1-Step Diffusion Distillation via Deep Equilibrium Models <a class="pub-meta pub-meta--link" href="{{ site.baseurl }}/projects/?venue=neurips">NeurIPS</a><a class="pub-meta pub-meta--link" href="{{ site.baseurl }}/projects/?year=2023">2023</a> <br>
  **Zhengyang Geng**\*, Ashwini Pokle\*, and J. Zico Kolter <br>
  **TL;DR**: Equilibrium Transformer + offline distillation for one-step diffusion. <br>
  [[Paper](https://openreview.net/pdf?id=f9eVDYrKXI)] [[Code](https://github.com/locuslab/get)] [[BibTeX](/assets/bib/deq-diffusion.bib)]

- Deep Equilibrium Approaches To Diffusion Models <a class="pub-meta pub-meta--link" href="{{ site.baseurl }}/projects/?venue=neurips">NeurIPS</a><a class="pub-meta pub-meta--link" href="{{ site.baseurl }}/projects/?year=2022">2022</a> <br>
  Ashwini Pokle, **Zhengyang Geng**, and J. Zico Kolter <br>
  **TL;DR**: Parallel diffusion decoding via fixed-point equations. <br>
  [[Paper](https://arxiv.org/abs/2210.12867)] [[Code](https://github.com/locuslab/deq-ddim)] [[BibTeX](/assets/bib/deq-diffusion.bib)]

</div>

<div class="works-subgroup" markdown="1">
- Diff-Instruct*: Towards Human-Preferred One-step Text-to-image Generative Models <a class="pub-meta pub-meta--link" href="{{ site.baseurl }}/projects/?venue=icml">ICML</a><a class="pub-meta pub-meta--link" href="{{ site.baseurl }}/projects/?year=2025">2025</a> <br>
  Weijian Luo, Colin Zhang, Debing Zhang, and **Zhengyang Geng** <br>
  **TL;DR**: Score-based preference alignment for one-step text-to-image models. <br>
  [[Paper](https://arxiv.org/abs/2410.20898)] [[Code](https://github.com/pkulwj1994/diff_instruct_star)]

- One-Step Diffusion Distillation through Score Implicit Matching <a class="pub-meta pub-meta--link" href="{{ site.baseurl }}/projects/?venue=neurips">NeurIPS</a><a class="pub-meta pub-meta--link" href="{{ site.baseurl }}/projects/?year=2024">2024</a> <br>
  Weijian Luo, Zemin Huang, **Zhengyang Geng**, J. Zico Kolter, and Guo-jun Qi <br>
  **TL;DR**: Data-free one-step diffusion distillation via score implicit matching. <br>
  [[Paper](https://arxiv.org/abs/2410.16794)] [[Code](https://github.com/maple-research-lab/SIM)]
</div>

<div class="works-subgroup" markdown="1">
- <img src="/images/Medusa_logo.png" alt="Medusa Logo" width="44" style="vertical-align:middle;margin-right:8px;"> Medusa: Simple Framework for Accelerating LLM Generation with Multiple Decoding Heads <a class="pub-meta pub-meta--link" href="{{ site.baseurl }}/projects/?venue=icml">ICML</a><a class="pub-meta pub-meta--link" href="{{ site.baseurl }}/projects/?year=2024">2024</a> <br>
  Tianle Cai\*, Yuhong Li\*, **Zhengyang Geng**, Hongwu Peng, and Tri Dao <br>
  **TL;DR**: Simple LLM acceleration with multiple decoding heads and self-verification. <br>
  [[Paper](https://arxiv.org/abs/2401.10774)] [[Blog](https://sites.google.com/view/medusa-llm)] [[Code](https://github.com/FasterDecoding/Medusa)]
</div>

</div>
</details>

<details class="works-group" markdown="1">
<summary><span class="works-group__head"><span class="works-group__title">Neural Attractors & Adaptive Computation</span><span class="works-group__tag">towards &infin;-step</span></span></summary>
<div class="works-group__content" markdown="1">

- Equilibrium Reasoners: Learning Attractors Enables Scalable Reasoning <a class="pub-meta pub-meta--link" href="{{ site.baseurl }}/projects/?venue=icml">ICML</a><a class="pub-meta pub-meta--link" href="{{ site.baseurl }}/projects/?year=2026">2026</a> <br>
  Benhao Huang, **Zhengyang Geng**<sup>†</sup>, and J. Zico Kolter <br>
  **TL;DR**: Task-conditioned attractors enable scalable latent reasoning. <br>
  [[Paper](https://arxiv.org/abs/2605.21488)] [[Code](https://github.com/locuslab/eqr)]

- <img src="/images/TorchDEQ_Logo.gif" alt="TorchDEQ Logo" width="44" style="vertical-align:middle;margin-right:8px;"> TorchDEQ: A Library for Deep Equilibrium Models <a class="pub-meta pub-meta--link" href="{{ site.baseurl }}/projects/?venue=report">Tech Report</a><a class="pub-meta pub-meta--link" href="{{ site.baseurl }}/projects/?year=2023">2023</a> <br>
  **Zhengyang Geng** and J. Zico Kolter <br>
  **TL;DR**: Modern fixed-point systems in PyTorch. <br>
  [[Report](https://arxiv.org/abs/2310.18605)] [[Code](https://github.com/locuslab/get)] [[Colab Tutorial](https://colab.research.google.com/drive/12HiUnde7qLadeZGGtt7FITnSnbUmJr-I?usp=sharing)] [[Doc](https://torchdeq.readthedocs.io/en/latest/get_started.html)] [[DEQ Zoo](https://torchdeq.readthedocs.io/en/latest/deq-zoo/model.html)]

- Deep Equilibrium Optical Flow Estimation <a class="pub-meta pub-meta--link" href="{{ site.baseurl }}/projects/?venue=cvpr">CVPR</a><a class="pub-meta pub-meta--link" href="{{ site.baseurl }}/projects/?year=2022">2022</a> <br>
  Shaojie Bai\*, **Zhengyang Geng**\*, Yash Savani, and J. Zico Kolter <br>
  **TL;DR**: Harder problems, more compute, better convergence and performance. <br>
  [[Paper](https://arxiv.org/abs/2204.08442)] [[Code](https://github.com/locuslab/deq-flow)] [[BibTeX](/assets/bib/deq-flow.bib)]

- On Training Implicit Models <a class="pub-meta pub-meta--link" href="{{ site.baseurl }}/projects/?venue=neurips">NeurIPS</a><a class="pub-meta pub-meta--link" href="{{ site.baseurl }}/projects/?year=2021">2021</a> <br>
  **Zhengyang Geng**\*, Xin-Yu Zhang\*, Shaojie Bai, Yisen Wang, and Zhouchen Lin <br>
  **TL;DR**: Inexact gradient training can be cheap, fast, and stable. <br>
  [[Paper](https://arxiv.org/pdf/2111.05177.pdf)] [[Slides](/assets/slides/2021_NeurIPS_On_Training_Implicit_Models_slides.pdf)] [[Poster](/assets/poster/2021_NeurIPS_On_Training_Implicit_Models_poster.pdf)] [[Code](https://github.com/Gsunshine/phantom_grad)] [[BibTeX](/assets/bib/phantom_grad.bib)]

- Is Attention Better Than Matrix Decomposition? <a class="pub-meta pub-meta--link" href="{{ site.baseurl }}/projects/?venue=iclr">ICLR</a><a class="pub-meta pub-meta--link" href="{{ site.baseurl }}/projects/?year=2021">2021</a> <span class="pub-badge pub-badge--top">Top 3%</span> <br>
  **Zhengyang Geng**\*, Meng-Hao Guo\*, Hongxu Chen, Xia Li, Ke Wei, and Zhouchen Lin <br>
  **TL;DR**: Optimization (matrix decomposition) as attention. <br>
  [[Paper](https://arxiv.org/pdf/2109.04553.pdf)] [[Code](https://github.com/Gsunshine/Enjoy-Hamburger)] [Blog Series [1 (zh)](https://zhuanlan.zhihu.com/p/369769485), [2 (zh)](https://zhuanlan.zhihu.com/p/369855045), [3 (zh)](https://zhuanlan.zhihu.com/p/370410446)] [[Poster](/assets/poster/2021_ICLR_Ham_poster.png)] [[BibTeX](/assets/bib/ham.bib)]

</div>
</details>

<p><a class="btn btn--primary works-full-btn" href="{{ site.author.googlescholar }}">Full List (Google Scholar)</a></p>


  
  
