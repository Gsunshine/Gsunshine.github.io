---
permalink: /
title: "About me"
excerpt: "About me"
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---

Hi! I'm a CS Ph.D. student at CMU, advised by [Zico Kolter](https://zicokolter.com/). Previously, I was a research assistant at Peking University, advised by [Zhouchen Lin](https://zhouchenlin.github.io/). I also had a wonderful summer at Meta Reality Labs with [Shaojie Bai](https://jerrybai1995.github.io/) on generative avatar encoding.

I am an enthusiast of dynamics, recognizing and developing dynamics that self-organize complex systems. Here is my [CV](https://www.overleaf.com/read/dggtmczgrysp).

Interests
---------

I have eclectic interests in machine learning and deep learning, especially the dynamics in deep learning and the dynamics of deep learning. I believe that structured decomposition, i.e., disentanglement, is a key to understanding the emergence of intelligence, while it can be elegantly formulated and achieved by the dynamics.

- For the dynamics in deep learning, I study differentiable programming, nested optimization, and fixed point system as the construction principle in neural networks.
  - This is the "forward" pass.
- For the dynamics of deep learning, I try to understand the training dynamics of neural networks. I am fascinated by their landscape. A strong perception drives me to believe that many problems in model design can be attributed to training.
  - This is the "backward" pass.

I am also interested in developing principled learning methods for scientific problems through the dynamics.

Research
---------

- <div style="display: flex; align-items: center; gap: 10px;">
    <img src="/images/TorchDEQ_Logo.gif" alt="TorchDEQ Logo" width="55">
    <div>
      <h3 style="margin-bottom: 5px;margin-top: 5px;">TorchDEQ: A Library for Deep Equilibrium Models</h3>
      <p style="margin-top: 5px;margin-bottom: 5px"><strong>Zhengyang Geng</strong>, and J. Zico Kolter</p>
    </div>
  </div>

  **TL;DR**: Modern Fixed Point Systems using Pytorch. \
  [[Report](https://arxiv.org/abs/2310.18605)] [[Code](https://github.com/locuslab/get)] [[Colab Tutorial](https://colab.research.google.com/drive/12HiUnde7qLadeZGGtt7FITnSnbUmJr-I?usp=sharing)] [[Doc](https://torchdeq.readthedocs.io/en/latest/get_started.html)] [[DEQ Zoo](https://torchdeq.readthedocs.io/en/latest/deq-zoo/model.html)]

- 1-Step Diffusion Distillation via Deep Equilibrium Models \
  In *Neural Information Processing Systems (NeurIPS) 2023* \
  **Zhengyang Geng**\*, Ashwini Pokle\*, and J. Zico Kolter \
  **TL;DR**: Generative Equilibrium Transformer (GET) as strong 1-step diffusion learner. \
  [[PDF](https://openreview.net/pdf?id=f9eVDYrKXI)] [[Code](https://github.com/locuslab/get)] [[BibTex](https://github.com/Gsunshine/Gsunshine.github.io/blob/master/assets/bib/deq-diffusion.bib)] 

- <div style="display: flex; align-items: center; gap: 10px;">
    <img src="https://lh5.googleusercontent.com/raLdydpYW2EslHE6wFU_p-X-GF8r8OAFI2dap6W4pCNYgDLs4-dGqozHyfCwdt_xmkJks7yB29nUJvLfANISoUQqN5Q6gp3d3Mx8pMvsIpgygpC8px_NDAu5rw-AH9wZAg=w1280" alt="Medusa Logo" width="55">
    <div>
      <h3 style="margin-bottom: 5px;margin-top: 5px;">Medusa: Simple Framework for Accelerating LLM Generation with Multiple Decoding Heads</h3>
      <p style="margin-top: 5px;margin-bottom: 5px"> Tianle Cai*, Yuhong Li*, <strong>Zhengyang Geng</strong>, Hongwu Peng, Tri Dao</p>
    </div>
  </div>

  **TL;DR**: Simple LLM inference with multiple decoding heads and self-verification. Lossless 2x acceleration. \
  [[Code](https://github.com/FasterDecoding/Medusa)] [[Blog](https://sites.google.com/view/medusa-llm)]

- Equilibrium Image Denoising With Implicit Differentiation \
  In *IEEE Transactions on Image Processing* \
  Qi Chen, Yifei Wang, **Zhengyang Geng**, Yisen Wang, Jiansheng Yang, and Zhouchen Lin \
  **TL;DR**: Equilibrium image denoising with implicit differentiation. \
  [[PDF](https://ieeexplore.ieee.org/abstract/document/100705887)] [Code] [[BibTex](https://github.com/Gsunshine/Gsunshine.github.io/blob/master/assets/bib/nerd.bib)]

- Deep Equilibrium Approaches To Diffusion Models \
  In *Neural Information Processing Systems (NeurIPS) 2022* \
  Ashwini Pokle, **Zhengyang Geng**, and J. Zico Kolter \
  **TL;DR**: Parallel diffusion decoding via a joint lower-triangular equilibrium process. \
  [[PDF](https://arxiv.org/abs/2210.12867)] [[Code](https://github.com/locuslab/deq-ddim)] [[BibTex](https://github.com/Gsunshine/Gsunshine.github.io/blob/master/assets/bib/deq-diffusion.bib)] 

- Eliminating Gradient Conflict in Reference-based Line-art Colorization \
  Zekun Li, **Zhengyang Geng**, Zhao Kang, Wenyu Chen, Yibo Yang \
  In *Proceedings of European Conference on Computer Vision (ECCV) 2022* \
  **TL;DR**: Avoid gradient conflicts in attention training. \
  [[PDF](https://arxiv.org/abs/2207.06095)] [[Code](https://github.com/kunkun0w0/SGA)] [[BibTex](https://github.com/Gsunshine/Gsunshine.github.io/blob/master/assets/bib/sga.bib)]

- Deep Equilibrium Optical Flow Estimation \
  Shaojie Bai\*, **Zhengyang Geng**\*, Yash Savani, J. Zico Kolter
  (\*equal contribution) \
  In *Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition (CVPR) 2022* \
  **TL;DR**: Equilibrium solving as flow estimation, trained by inexact gradient and fixed point correction. \
  [[PDF](https://arxiv.org/abs/2204.08442)] [[Code](https://github.com/locuslab/deq-flow)] [[BibTex](https://github.com/Gsunshine/Gsunshine.github.io/blob/master/assets/bib/deq-flow.bib)] 

- On Training Implicit Models \
  **Zhengyang Geng**\*, Xin-Yu Zhang\*, Shaojie Bai, Yisen Wang, Zhouchen Lin
  (\*equal contribution) \
  In *Neural Information Processing Systems (NeurIPS) 2021* \
  **TL;DR**: Cheap, fast, and stable inexact gradient works as well as exact implicit differentiation. \
  [[PDF](https://arxiv.org/pdf/2111.05177.pdf)] [[Slides](https://github.com/Gsunshine/Gsunshine.github.io/blob/master/assets/slides/2021_NeurIPS_On_Training_Implicit_Models_slides.pdf)] [[Poster](https://github.com/Gsunshine/Gsunshine.github.io/blob/master/assets/poster/2021_NeurIPS_On_Training_Implicit_Models_poster.pdf)] [[Code](https://github.com/Gsunshine/phantom_grad)] [[BibTex](https://github.com/Gsunshine/Gsunshine.github.io/blob/master/assets/bib/phantom_grad.bib)] 

- Residual Relaxation for Multi-view Representation Learning \
  Yifei Wang, **Zhengyang Geng**, Feng Jiang, Chuming Li, Yisen Wang, Jiansheng Yang, Zhouchen Lin. \
  In *Neural Information Processing Systems (NeurIPS) 2021* \
  **TL;DR**: Equivariant contrastive learning replaces invariant contrastive learning. \
  [[PDF](https://arxiv.org/pdf/2110.15348.pdf)] [[Slides](https://yifeiwang77.github.io/files/slides/NeurIPS2021_Prelax_slides.pdf)] [[BibTex](https://github.com/Gsunshine/Gsunshine.github.io/blob/master/assets/bib/prelax.bib)]

- Is Attention Better Than Matrix Decomposition? \
  **Zhengyang Geng**\*, Meng-Hao Guo\*, Hongxu Chen, Xia Li, Ke Wei, Zhouchen Lin.
  (\*equal contribution) \
  In *International Conference on Learning Representations (ICLR) 2021*, **<font color='orange'>top 3%</font>**. \
  **TL;DR**: 1-step gradient trained non-convex matrix recovery as a global context layer. \
  [[PDF](https://arxiv.org/pdf/2109.04553.pdf)] [[Code](https://github.com/Gsunshine/Enjoy-Hamburger)] [Blog Series [1 (zh)](https://zhuanlan.zhihu.com/p/369769485), [2 (zh)](https://zhuanlan.zhihu.com/p/369855045), [3 (zh)](https://zhuanlan.zhihu.com/p/370410446)] [[Poster](https://github.com/Gsunshine/Gsunshine.github.io/blob/master/assets/poster/2021_ICLR_Ham_poster.png)] [[BibTex](https://github.com/Gsunshine/Gsunshine.github.io/blob/master/assets/bib/ham.bib)] 

  
  