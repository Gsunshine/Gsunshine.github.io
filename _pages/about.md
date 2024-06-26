---
permalink: /
title: "About me"
excerpt: "About me"
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---

Hi! I'm a CS Ph.D. student at CMU advised by [Zico Kolter](https://zicokolter.com/). Previously, I was a research assistant at Peking University, advised by [Zhouchen Lin](https://zhouchenlin.github.io/). I also had a wonderful summer at Meta Reality Labs with [Shaojie Bai](https://scholar.google.com/citations?user=DLVP3PcAAAAJ&hl=en) working on generative avatar encoding.

I am an enthusiast of dynamics, recognizing, understanding, and developing dynamics that self-organize complex systems. 

Research
---------

I have eclectic interests in machine learning and deep learning, especially when combined with dynamics. I believe that structured decomposition (perception) and reconstruction (generation) are key to understanding the emergence of general intelligence, which dynamics can elegantly achieve.

- Regarding the "forward" pass, I study **dynamical systems** (fixed point equations, optimization, differential equations, etc) as the construction method and learning principle in neural networks.
- Regarding the "backward" pass, I pursue a better understanding of neural network **training dynamics**. I am fascinated by their landscape. A strong belief drives me to investigate the interaction between data/env, model, and learning dynamics.

I am also interested in modeling and understanding nature through dynamics. The only constant is change. The invariance under change is truth. :D

Twitter
---------

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">There is no need to anneal down life&#39;s &quot;learning rate&quot; too early. Even today, I often feel I should &quot;restart&quot; to extricate myself from too many AI papers📝or bubbles🫧.<br><br>AGI should offer people better childhood and teenage lives, not grasping people to serve and achieve itself.… <a href="https://t.co/JCrRfL3boU">https://t.co/JCrRfL3boU</a></p>&mdash; Zhengyang Geng (@ZhengyangGeng) <a href="https://twitter.com/ZhengyangGeng/status/1778672398046216314?ref_src=twsrc%5Etfw">April 12, 2024</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

Projects
---------

- Consistency Models Made Easy \
  **Zhengyang Geng**, William Luo, Ashwini Pokle, and J. Zico Kolter \
  **TL;DR**: Easy Consistency Tuning through Self Teacher :D \
  [[Blog](https://gsunshine.notion.site/Consistency-Models-Made-Easy-954205c0b4a24c009f78719f43b419cc?pvs=4)] [[Code](https://github.com/locuslab/ect)] [[BibTex](https://github.com/Gsunshine/Gsunshine.github.io/blob/master/assets/bib/ect.bib)] 

- <div style="display: flex; align-items: center; gap: 10px;">
    <img src="/images/TorchDEQ_Logo.gif" alt="TorchDEQ Logo" width="55">
    <div>
      <p style="margin-bottom: 5px;margin-top: 5px;">TorchDEQ: A Library for Deep Equilibrium Models</p>
      <p style="margin-top: 5px;margin-bottom: 5px"><strong>Zhengyang Geng</strong>, and J. Zico Kolter</p>
    </div>
  </div>

  **TL;DR**: Modern Fixed Point Systems using Pytorch. \
  [[Report](https://arxiv.org/abs/2310.18605)] [[Code](https://github.com/locuslab/get)] [[Colab Tutorial](https://colab.research.google.com/drive/12HiUnde7qLadeZGGtt7FITnSnbUmJr-I?usp=sharing)] [[Doc](https://torchdeq.readthedocs.io/en/latest/get_started.html)] [[DEQ Zoo](https://torchdeq.readthedocs.io/en/latest/deq-zoo/model.html)]

- 1-Step Diffusion Distillation via Deep Equilibrium Models \
  In *Neural Information Processing Systems (NeurIPS) 2023* \
  **Zhengyang Geng**\*, Ashwini Pokle\*, and J. Zico Kolter \
  **TL;DR**: Generative Equilibrium Transformer (GET) as strong 1-step diffusion learner. \
  [[Paper](https://openreview.net/pdf?id=f9eVDYrKXI)] [[Code](https://github.com/locuslab/get)] [[BibTex](https://github.com/Gsunshine/Gsunshine.github.io/blob/master/assets/bib/deq-diffusion.bib)] 

- <div style="display: flex; align-items: center; gap: 10px;">
    <img src="/images/Medusa_logo.png" alt="Medusa Logo" width="55">
    <div>
      <p style="margin-bottom: 5px;margin-top: 5px;">Medusa: Simple Framework for Accelerating LLM Generation with Multiple Decoding Heads</p>
      <p style="margin-top: 5px;margin-bottom: 5px"> Tianle Cai*, Yuhong Li*, <strong>Zhengyang Geng</strong>, Hongwu Peng, Tri Dao</p>
    </div>
  </div>

  **TL;DR**: Simple LLM acceleration with multiple decoding heads and self-verification. \
  [[Report](https://arxiv.org/abs/2401.10774)] [[Blog](https://sites.google.com/view/medusa-llm)] [[Code](https://github.com/FasterDecoding/Medusa)] 

- Equilibrium Image Denoising With Implicit Differentiation \
  In *IEEE Transactions on Image Processing* \
  Qi Chen, Yifei Wang, **Zhengyang Geng**, Yisen Wang, Jiansheng Yang, and Zhouchen Lin \
  **TL;DR**: Equilibrium image denoising with implicit differentiation. \
  [[Paper](https://ieeexplore.ieee.org/abstract/document/100705887)] [[BibTex](https://github.com/Gsunshine/Gsunshine.github.io/blob/master/assets/bib/nerd.bib)]

- Deep Equilibrium Approaches To Diffusion Models \
  In *Neural Information Processing Systems (NeurIPS) 2022* \
  Ashwini Pokle, **Zhengyang Geng**, and J. Zico Kolter \
  **TL;DR**: Parallel diffusion decoding via fixed point equations. \
  [[Paper](https://arxiv.org/abs/2210.12867)] [[Code](https://github.com/locuslab/deq-ddim)] [[BibTex](https://github.com/Gsunshine/Gsunshine.github.io/blob/master/assets/bib/deq-diffusion.bib)] 

- Eliminating Gradient Conflict in Reference-based Line-art Colorization \
  Zekun Li, **Zhengyang Geng**, Zhao Kang, Wenyu Chen, Yibo Yang \
  In *Proceedings of European Conference on Computer Vision (ECCV) 2022* \
  **TL;DR**: Investigating and alleviating gradient conflicts in attention training. \
  [[Paper](https://arxiv.org/abs/2207.06095)] [[Code](https://github.com/kunkun0w0/SGA)] [[BibTex](https://github.com/Gsunshine/Gsunshine.github.io/blob/master/assets/bib/sga.bib)]

- Deep Equilibrium Optical Flow Estimation \
  Shaojie Bai\*, **Zhengyang Geng**\*, Yash Savani, J. Zico Kolter
  (\*equal contribution) \
  In *Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition (CVPR) 2022* \
  **TL;DR**: Equilibrium solving as flow estimation. SoTA zero-shot generalization. \
    [![PWC](https://img.shields.io/endpoint.svg?url=https://paperswithcode.com/badge/deep-equilibrium-optical-flow-estimation/optical-flow-estimation-on-kitti-2015-train)](https://paperswithcode.com/sota/optical-flow-estimation-on-kitti-2015-train?p=deep-equilibrium-optical-flow-estimation) \
  [[Paper](https://arxiv.org/abs/2204.08442)] [[Code](https://github.com/locuslab/deq-flow)] [[BibTex](https://github.com/Gsunshine/Gsunshine.github.io/blob/master/assets/bib/deq-flow.bib)] 

- On Training Implicit Models \
  **Zhengyang Geng**\*, Xin-Yu Zhang\*, Shaojie Bai, Yisen Wang, Zhouchen Lin
  (\*equal contribution) \
  In *Neural Information Processing Systems (NeurIPS) 2021* \
  **TL;DR**: Cheap, fast, and stable inexact gradient works as well as implicit differentiation. \
  [[Paper](https://arxiv.org/pdf/2111.05177.pdf)] [[Slides](https://github.com/Gsunshine/Gsunshine.github.io/blob/master/assets/slides/2021_NeurIPS_On_Training_Implicit_Models_slides.pdf)] [[Poster](https://github.com/Gsunshine/Gsunshine.github.io/blob/master/assets/poster/2021_NeurIPS_On_Training_Implicit_Models_poster.pdf)] [[Code](https://github.com/Gsunshine/phantom_grad)] [[BibTex](https://github.com/Gsunshine/Gsunshine.github.io/blob/master/assets/bib/phantom_grad.bib)] 

- Residual Relaxation for Multi-view Representation Learning \
  Yifei Wang, **Zhengyang Geng**, Feng Jiang, Chuming Li, Yisen Wang, Jiansheng Yang, Zhouchen Lin. \
  In *Neural Information Processing Systems (NeurIPS) 2021* \
  **TL;DR**: Equivariant contrastive learning replaces invariant contrastive learning. \
  [[Paper](https://arxiv.org/pdf/2110.15348.pdf)] [[Slides](https://yifeiwang77.github.io/files/slides/NeurIPS2021_Prelax_slides.pdf)] [[BibTex](https://github.com/Gsunshine/Gsunshine.github.io/blob/master/assets/bib/prelax.bib)]

- Is Attention Better Than Matrix Decomposition? \
  **Zhengyang Geng**\*, Meng-Hao Guo\*, Hongxu Chen, Xia Li, Ke Wei, Zhouchen Lin.
  (\*equal contribution) \
  In *International Conference on Learning Representations (ICLR) 2021*, **<font color='orange'>top 3%</font>**. \
  **TL;DR**: Optimization (matrix decomposition) as attention. \
  [[PDPaperF](https://arxiv.org/pdf/2109.04553.pdf)] [[Code](https://github.com/Gsunshine/Enjoy-Hamburger)] [Blog Series [1 (zh)](https://zhuanlan.zhihu.com/p/369769485), [2 (zh)](https://zhuanlan.zhihu.com/p/369855045), [3 (zh)](https://zhuanlan.zhihu.com/p/370410446)] [[Poster](https://github.com/Gsunshine/Gsunshine.github.io/blob/master/assets/poster/2021_ICLR_Ham_poster.png)] [[BibTex](https://github.com/Gsunshine/Gsunshine.github.io/blob/master/assets/bib/ham.bib)] 

  
  