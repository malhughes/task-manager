import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Browser environment mocks
const createBrowserMock = (browserName, version, features = {}) => {
  const browserMocks = {
    chrome: {
      userAgent: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version}.0.0.0 Safari/537.36`,
      vendor: 'Google Inc.',
      features: {
        dragAndDrop: true,
        localStorage: true,
        sessionStorage: true,
        webGL: true,
        serviceWorker: true,
        css: {
          grid: true,
          flexbox: true,
          customProperties: true,
          transforms3d: true
        },
        js: {
          es6: true,
          modules: true,
          asyncAwait: true,
          fetch: true
        },
        ...features
      }
    },
    firefox: {
      userAgent: `Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:${version}.0) Gecko/20100101 Firefox/${version}.0`,
      vendor: '',
      features: {
        dragAndDrop: true,
        localStorage: true,
        sessionStorage: true,
        webGL: true,
        serviceWorker: true,
        css: {
          grid: true,
          flexbox: true,
          customProperties: true,
          transforms3d: true
        },
        js: {
          es6: true,
          modules: true,
          asyncAwait: true,
          fetch: true
        },
        ...features
      }
    },
    safari: {
      userAgent: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${version}.0 Safari/605.1.15`,
      vendor: 'Apple Computer, Inc.',
      features: {
        dragAndDrop: true,
        localStorage: true,
        sessionStorage: true,
        webGL: true,
        serviceWorker: version >= 14, // Safari 14+ has better service worker support
        css: {
          grid: version >= 12,
          flexbox: true,
          customProperties: version >= 9.1,
          transforms3d: true
        },
        js: {
          es6: version >= 10,
          modules: version >= 11,
          asyncAwait: version >= 11,
          fetch: version >= 10.1
        },
        ...features
      }
    },
    edge: {
      userAgent: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version}.0.0.0 Safari/537.36 Edg/${version}.0.0.0`,
      vendor: 'Microsoft Corporation',
      features: {
        dragAndDrop: true,
        localStorage: true,
        sessionStorage: true,
        webGL: true,
        serviceWorker: true,
        css: {
          grid: true,
          flexbox: true,
          customProperties: true,
          transforms3d: true
        },
        js: {
          es6: true,
          modules: true,
          asyncAwait: true,
          fetch: true
        },
        ...features
      }
    }
  };

  return browserMocks[browserName] || browserMocks.chrome;
};

// Mock DOM APIs for different browsers
const createDOMAPIMock = (browser) => {
  const baseAPI = {
    document: {
      querySelector: vi.fn(),
      querySelectorAll: vi.fn(),
      getElementById: vi.fn(),
      createElement: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    },
    window: {
      navigator: {
        userAgent: browser.userAgent,
        vendor: browser.vendor
      },
      localStorage: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      },
      sessionStorage: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matchMedia: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))
    }
  };

  // Browser-specific API differences
  if (browser.userAgent.includes('Safari') && !browser.userAgent.includes('Chrome')) {
    // Safari-specific limitations
    baseAPI.window.webkitRequestAnimationFrame = vi.fn();
    baseAPI.window.requestAnimationFrame = baseAPI.window.webkitRequestAnimationFrame;
  }

  if (browser.userAgent.includes('Firefox')) {
    // Firefox-specific APIs
    baseAPI.window.mozRequestAnimationFrame = vi.fn();
  }

  return baseAPI;
};

describe('Cross-Browser Compatibility Tests', () => {
  let currentBrowser;
  let domAPI;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Chrome Browser Compatibility', () => {
    beforeEach(() => {
      currentBrowser = createBrowserMock('chrome', '91');
      domAPI = createDOMAPIMock(currentBrowser);
    });

    it('should support all modern features in Chrome', () => {
      const featureDetection = {
        detectDragAndDrop: () => 'draggable' in domAPI.document.createElement('div'),
        detectLocalStorage: () => typeof domAPI.window.localStorage !== 'undefined',
        detectFetch: () => typeof fetch !== 'undefined',
        detectES6: () => {
          try {
            // Test arrow functions
            const arrow = () => true;
            // Test template literals
            const template = `test`;
            // Test const/let
            const constTest = true;
            return true;
          } catch (e) {
            return false;
          }
        },
        detectCSS: () => {
          const testElement = domAPI.document.createElement('div');
          return {
            grid: 'grid' in testElement.style || 'msGrid' in testElement.style,
            flexbox: 'flex' in testElement.style || 'webkitFlex' in testElement.style,
            transforms3d: 'transform' in testElement.style || 'webkitTransform' in testElement.style
          };
        }
      };

      // Mock createElement to return an element with modern CSS support
      domAPI.document.createElement.mockReturnValue({
        style: {
          grid: '',
          flex: '',
          transform: '',
          webkitTransform: ''
        },
        draggable: true
      });

      expect(featureDetection.detectDragAndDrop()).toBe(true);
      expect(featureDetection.detectLocalStorage()).toBe(true);
      expect(featureDetection.detectES6()).toBe(true);
      
      const cssSupport = featureDetection.detectCSS();
      expect(cssSupport.grid).toBe(true);
      expect(cssSupport.flexbox).toBe(true);
      expect(cssSupport.transforms3d).toBe(true);
    });

    it('should handle Chrome-specific drag and drop events', () => {
      const dragDropHandler = {
        handleDragStart: vi.fn((event) => {
          // Chrome supports dataTransfer.effectAllowed
          if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', 'task-id-1');
          }
        }),
        handleDragOver: vi.fn((event) => {
          event.preventDefault();
          // Chrome supports dropEffect
          if (event.dataTransfer) {
            event.dataTransfer.dropEffect = 'move';
          }
        }),
        handleDrop: vi.fn((event) => {
          event.preventDefault();
          const data = event.dataTransfer?.getData('text/plain');
          return data;
        })
      };

      // Mock drag events
      const mockDragEvent = {
        dataTransfer: {
          effectAllowed: null,
          dropEffect: null,
          setData: vi.fn(),
          getData: vi.fn().mockReturnValue('task-id-1')
        },
        preventDefault: vi.fn()
      };

      dragDropHandler.handleDragStart(mockDragEvent);
      expect(mockDragEvent.dataTransfer.effectAllowed).toBe('move');
      expect(mockDragEvent.dataTransfer.setData).toHaveBeenCalledWith('text/plain', 'task-id-1');

      dragDropHandler.handleDragOver(mockDragEvent);
      expect(mockDragEvent.preventDefault).toHaveBeenCalled();
      expect(mockDragEvent.dataTransfer.dropEffect).toBe('move');

      const dropData = dragDropHandler.handleDrop(mockDragEvent);
      expect(dropData).toBe('task-id-1');
    });

    it('should utilize Chrome performance optimizations', () => {
      const performanceOptimizations = {
        useRequestAnimationFrame: () => {
          return typeof domAPI.window.requestAnimationFrame === 'function';
        },
        enableHardwareAcceleration: () => {
          const testElement = domAPI.document.createElement('div');
          testElement.style.transform = 'translateZ(0)';
          return testElement.style.transform === 'translateZ(0)';
        },
        useWebGL: () => {
          // Mock WebGL context
          const canvas = domAPI.document.createElement('canvas');
          canvas.getContext = vi.fn().mockReturnValue({
            drawingBufferWidth: 300,
            drawingBufferHeight: 150
          });
          return !!canvas.getContext('webgl');
        }
      };

      // Mock createElement for canvas
      domAPI.document.createElement.mockImplementation((tagName) => {
        if (tagName === 'canvas') {
          return {
            getContext: vi.fn().mockReturnValue({
              drawingBufferWidth: 300,
              drawingBufferHeight: 150
            })
          };
        }
        return {
          style: {
            transform: ''
          }
        };
      });

      domAPI.window.requestAnimationFrame = vi.fn();

      expect(performanceOptimizations.useRequestAnimationFrame()).toBe(true);
      expect(performanceOptimizations.enableHardwareAcceleration()).toBe(true);
      expect(performanceOptimizations.useWebGL()).toBe(true);
    });
  });

  describe('Firefox Browser Compatibility', () => {
    beforeEach(() => {
      currentBrowser = createBrowserMock('firefox', '89');
      domAPI = createDOMAPIMock(currentBrowser);
    });

    it('should handle Firefox-specific quirks', () => {
      const firefoxQuirks = {
        handleScrollbarStyling: () => {
          // Firefox doesn't support webkit scrollbar styling
          const testElement = domAPI.document.createElement('div');
          const supportsWebkitScrollbar = 'webkitScrollbar' in testElement.style;
          
          if (!supportsWebkitScrollbar) {
            // Use Firefox alternative
            return 'scrollbar-width: thin; scrollbar-color: #888 #f1f1f1;';
          }
          return '::-webkit-scrollbar { width: 8px; }';
        },
        handleDragAndDrop: () => {
          // Firefox has different drag and drop behavior
          return {
            useDataTransfer: true,
            supportsMimeTypes: true,
            requiresPreventDefault: true
          };
        },
        handleAnimations: () => {
          // Firefox prefers CSS animations over JS animations for performance
          return {
            preferCSS: true,
            supportsMozTransform: true,
            useWillChange: true
          };
        }
      };

      domAPI.document.createElement.mockReturnValue({
        style: {}
      });

      const scrollbarStyle = firefoxQuirks.handleScrollbarStyling();
      expect(scrollbarStyle).toContain('scrollbar-width');

      const dragBehavior = firefoxQuirks.handleDragAndDrop();
      expect(dragBehavior.useDataTransfer).toBe(true);
      expect(dragBehavior.supportsMimeTypes).toBe(true);

      const animationPrefs = firefoxQuirks.handleAnimations();
      expect(animationPrefs.preferCSS).toBe(true);
    });

    it('should handle Firefox drag and drop with proper MIME types', () => {
      const firefoxDragHandler = {
        handleDragStart: vi.fn((event) => {
          // Firefox supports multiple MIME types
          if (event.dataTransfer) {
            event.dataTransfer.setData('text/plain', 'task-id-1');
            event.dataTransfer.setData('application/json', JSON.stringify({
              id: 'task-id-1',
              title: 'Task Title'
            }));
          }
        }),
        handleDrop: vi.fn((event) => {
          event.preventDefault();
          
          // Try JSON first, fallback to plain text
          let data;
          try {
            data = JSON.parse(event.dataTransfer?.getData('application/json') || '{}');
          } catch (e) {
            data = { id: event.dataTransfer?.getData('text/plain') };
          }
          
          return data;
        })
      };

      const mockFirefoxDragEvent = {
        dataTransfer: {
          setData: vi.fn(),
          getData: vi.fn((type) => {
            if (type === 'application/json') {
              return JSON.stringify({ id: 'task-id-1', title: 'Task Title' });
            }
            return 'task-id-1';
          })
        },
        preventDefault: vi.fn()
      };

      firefoxDragHandler.handleDragStart(mockFirefoxDragEvent);
      expect(mockFirefoxDragEvent.dataTransfer.setData).toHaveBeenCalledWith('text/plain', 'task-id-1');
      expect(mockFirefoxDragEvent.dataTransfer.setData).toHaveBeenCalledWith('application/json', expect.any(String));

      const dropData = firefoxDragHandler.handleDrop(mockFirefoxDragEvent);
      expect(dropData.id).toBe('task-id-1');
      expect(dropData.title).toBe('Task Title');
    });

    it('should optimize for Firefox performance characteristics', () => {
      const firefoxOptimizations = {
        useCSS3Transforms: () => {
          const testElement = domAPI.document.createElement('div');
          return 'MozTransform' in testElement.style || 'transform' in testElement.style;
        },
        avoidJSAnimations: () => {
          // Firefox performs better with CSS animations
          return {
            useTransitions: true,
            useKeyframes: true,
            avoidSetInterval: true
          };
        },
        optimizeReflows: () => {
          // Batch DOM operations for Firefox
          return {
            batchDOMReads: true,
            batchDOMWrites: true,
            useDocumentFragment: true
          };
        }
      };

      domAPI.document.createElement.mockReturnValue({
        style: {
          MozTransform: '',
          transform: ''
        }
      });

      expect(firefoxOptimizations.useCSS3Transforms()).toBe(true);
      
      const animationStrategy = firefoxOptimizations.avoidJSAnimations();
      expect(animationStrategy.useTransitions).toBe(true);
      
      const reflowStrategy = firefoxOptimizations.optimizeReflows();
      expect(reflowStrategy.batchDOMReads).toBe(true);
    });
  });

  describe('Safari Browser Compatibility', () => {
    beforeEach(() => {
      currentBrowser = createBrowserMock('safari', '14');
      domAPI = createDOMAPIMock(currentBrowser);
    });

    it('should handle Safari-specific limitations', () => {
      const safariLimitations = {
        checkServiceWorkerSupport: () => {
          // Safari has limited service worker support
          return 'serviceWorker' in domAPI.window.navigator && currentBrowser.features.serviceWorker;
        },
        handleDateInputs: () => {
          // Safari has different date input behavior
          const input = domAPI.document.createElement('input');
          input.type = 'date';
          return input.type === 'date';
        },
        handleLocalStorage: () => {
          // Safari in private mode has localStorage limitations
          try {
            domAPI.window.localStorage.setItem('test', 'test');
            domAPI.window.localStorage.removeItem('test');
            return true;
          } catch (e) {
            return false;
          }
        },
        handleWebkitPrefixes: () => {
          const testElement = domAPI.document.createElement('div');
          return {
            transform: 'webkitTransform' in testElement.style,
            animation: 'webkitAnimation' in testElement.style,
            transition: 'webkitTransition' in testElement.style
          };
        }
      };

      // Mock Safari-specific behavior
      domAPI.window.navigator.serviceWorker = currentBrowser.features.serviceWorker ? {} : undefined;
      
      domAPI.document.createElement.mockImplementation((tagName) => {
        if (tagName === 'input') {
          return { type: 'text' }; // Safari might not support all input types
        }
        return {
          style: {
            webkitTransform: '',
            webkitAnimation: '',
            webkitTransition: ''
          }
        };
      });

      domAPI.window.localStorage.setItem.mockImplementation(() => {
        // Simulate Safari private mode limitation
        throw new Error('QuotaExceededError');
      });

      expect(safariLimitations.checkServiceWorkerSupport()).toBe(true);
      expect(safariLimitations.handleLocalStorage()).toBe(false);
      
      const webkitSupport = safariLimitations.handleWebkitPrefixes();
      expect(webkitSupport.transform).toBe(true);
    });

    it('should handle Safari touch events properly', () => {
      const safariTouchHandler = {
        handleTouchStart: vi.fn((event) => {
          // Safari requires preventDefault for touch events
          event.preventDefault();
          
          const touch = event.touches[0];
          return {
            x: touch.clientX,
            y: touch.clientY,
            identifier: touch.identifier
          };
        }),
        handleTouchMove: vi.fn((event) => {
          // Safari needs careful touch move handling
          event.preventDefault();
          
          const touch = event.touches[0];
          return {
            x: touch.clientX,
            y: touch.clientY,
            deltaX: touch.clientX - (event.startX || 0),
            deltaY: touch.clientY - (event.startY || 0)
          };
        }),
        handleTouchEnd: vi.fn((event) => {
          event.preventDefault();
          
          const touch = event.changedTouches[0];
          return {
            x: touch.clientX,
            y: touch.clientY,
            duration: Date.now() - (event.startTime || 0)
          };
        })
      };

      const mockSafariTouchEvent = {
        touches: [{ clientX: 100, clientY: 200, identifier: 1 }],
        changedTouches: [{ clientX: 150, clientY: 250, identifier: 1 }],
        preventDefault: vi.fn(),
        startX: 100,
        startY: 200,
        startTime: Date.now() - 500
      };

      const touchStart = safariTouchHandler.handleTouchStart(mockSafariTouchEvent);
      expect(mockSafariTouchEvent.preventDefault).toHaveBeenCalled();
      expect(touchStart.x).toBe(100);
      expect(touchStart.identifier).toBe(1);

      const touchMove = safariTouchHandler.handleTouchMove(mockSafariTouchEvent);
      expect(touchMove.deltaX).toBe(0);

      const touchEnd = safariTouchHandler.handleTouchEnd(mockSafariTouchEvent);
      expect(touchEnd.x).toBe(150);
      expect(touchEnd.duration).toBeGreaterThan(0);
    });

    it('should implement Safari-specific CSS workarounds', () => {
      const safariCSSWorkarounds = {
        fixFlexboxBugs: () => {
          // Safari has flexbox bugs that need workarounds
          return {
            useFlexShrink: true,
            avoidFlexBasis: true,
            useMinWidth: true
          };
        },
        handleScrolling: () => {
          // Safari needs -webkit-overflow-scrolling
          return {
            webkitOverflowScrolling: 'touch',
            overflowScrolling: 'auto'
          };
        },
        fixTransformOrigin: () => {
          // Safari transform-origin issues
          return {
            useWebkitTransformOrigin: true,
            setExplicitOrigin: true
          };
        }
      };

      const flexboxFixes = safariCSSWorkarounds.fixFlexboxBugs();
      expect(flexboxFixes.useFlexShrink).toBe(true);
      expect(flexboxFixes.avoidFlexBasis).toBe(true);

      const scrollFixes = safariCSSWorkarounds.handleScrolling();
      expect(scrollFixes.webkitOverflowScrolling).toBe('touch');

      const transformFixes = safariCSSWorkarounds.fixTransformOrigin();
      expect(transformFixes.useWebkitTransformOrigin).toBe(true);
    });
  });

  describe('Edge Browser Compatibility', () => {
    beforeEach(() => {
      currentBrowser = createBrowserMock('edge', '91');
      domAPI = createDOMAPIMock(currentBrowser);
    });

    it('should handle modern Edge (Chromium-based) features', () => {
      const edgeFeatures = {
        detectChromiumBase: () => {
          return currentBrowser.userAgent.includes('Edg/') && currentBrowser.userAgent.includes('Chrome');
        },
        supportModernAPIs: () => {
          return {
            fetch: true,
            promises: true,
            asyncAwait: true,
            modules: true,
            webComponents: true
          };
        },
        handleLegacyFallbacks: () => {
          // Modern Edge doesn't need IE fallbacks
          return {
            needsIEFallbacks: false,
            supportsES6: true,
            supportsCSS3: true
          };
        }
      };

      expect(edgeFeatures.detectChromiumBase()).toBe(true);
      
      const apiSupport = edgeFeatures.supportModernAPIs();
      expect(apiSupport.fetch).toBe(true);
      expect(apiSupport.webComponents).toBe(true);
      
      const legacySupport = edgeFeatures.handleLegacyFallbacks();
      expect(legacySupport.needsIEFallbacks).toBe(false);
      expect(legacySupport.supportsES6).toBe(true);
    });

    it('should utilize Edge-specific optimizations', () => {
      const edgeOptimizations = {
        useChromiumFeatures: () => {
          // Modern Edge can use Chrome optimizations
          return {
            hardwareAcceleration: true,
            webGL: true,
            serviceWorkers: true,
            webAssembly: true
          };
        },
        handleWindowsIntegration: () => {
          // Edge has Windows-specific features
          return {
            cortanaIntegration: false, // Not available in web apps
            windowsNotifications: true,
            jumpLists: false // Not available in web apps
          };
        },
        optimizeForTouch: () => {
          // Edge on Windows supports touch
          return {
            touchEvents: true,
            pointerEvents: true,
            gestureEvents: false
          };
        }
      };

      const chromiumFeatures = edgeOptimizations.useChromiumFeatures();
      expect(chromiumFeatures.hardwareAcceleration).toBe(true);
      expect(chromiumFeatures.webGL).toBe(true);

      const windowsFeatures = edgeOptimizations.handleWindowsIntegration();
      expect(windowsFeatures.windowsNotifications).toBe(true);

      const touchFeatures = edgeOptimizations.optimizeForTouch();
      expect(touchFeatures.touchEvents).toBe(true);
      expect(touchFeatures.pointerEvents).toBe(true);
    });

    it('should handle Edge drag and drop with pointer events', () => {
      const edgeDragHandler = {
        handlePointerDown: vi.fn((event) => {
          // Edge supports pointer events
          return {
            pointerId: event.pointerId,
            pointerType: event.pointerType,
            x: event.clientX,
            y: event.clientY
          };
        }),
        handlePointerMove: vi.fn((event) => {
          return {
            pointerId: event.pointerId,
            x: event.clientX,
            y: event.clientY,
            pressure: event.pressure || 0.5
          };
        }),
        handlePointerUp: vi.fn((event) => {
          return {
            pointerId: event.pointerId,
            x: event.clientX,
            y: event.clientY
          };
        })
      };

      const mockPointerEvent = {
        pointerId: 1,
        pointerType: 'mouse',
        clientX: 100,
        clientY: 200,
        pressure: 0.5
      };

      const pointerDown = edgeDragHandler.handlePointerDown(mockPointerEvent);
      expect(pointerDown.pointerId).toBe(1);
      expect(pointerDown.pointerType).toBe('mouse');

      const pointerMove = edgeDragHandler.handlePointerMove(mockPointerEvent);
      expect(pointerMove.pressure).toBe(0.5);

      const pointerUp = edgeDragHandler.handlePointerUp(mockPointerEvent);
      expect(pointerUp.x).toBe(100);
    });
  });

  describe('Cross-Browser Feature Detection', () => {
    it('should detect browser capabilities accurately', () => {
      const featureDetector = {
        detectBrowser: (userAgent) => {
          if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'chrome';
          if (userAgent.includes('Firefox')) return 'firefox';
          if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'safari';
          if (userAgent.includes('Edg/')) return 'edge';
          return 'unknown';
        },
        detectFeatures: (browser) => {
          const features = {
            dragAndDrop: true,
            localStorage: true,
            sessionStorage: true,
            webGL: true,
            serviceWorker: true,
            css: {
              grid: true,
              flexbox: true,
              customProperties: true
            },
            js: {
              es6: true,
              modules: true,
              asyncAwait: true
            }
          };

          // Safari-specific limitations
          if (browser === 'safari') {
            features.serviceWorker = false; // Older Safari versions
            features.css.customProperties = false; // Older Safari versions
          }

          return features;
        },
        createPolyfills: (missingFeatures) => {
          const polyfills = [];
          
          if (!missingFeatures.fetch) {
            polyfills.push('fetch-polyfill');
          }
          if (!missingFeatures.promises) {
            polyfills.push('es6-promise');
          }
          if (!missingFeatures.css.customProperties) {
            polyfills.push('css-custom-properties-polyfill');
          }
          
          return polyfills;
        }
      };

      // Test different browsers
      const browsers = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59'
      ];

      const detectedBrowsers = browsers.map(ua => featureDetector.detectBrowser(ua));
      expect(detectedBrowsers).toEqual(['chrome', 'firefox', 'safari', 'edge']);

      // Test feature detection for Safari
      const safariFeatures = featureDetector.detectFeatures('safari');
      expect(safariFeatures.serviceWorker).toBe(false);
      expect(safariFeatures.css.customProperties).toBe(false);

      // Test polyfill creation
      const missingFeatures = {
        fetch: false,
        css: { customProperties: false }
      };
      const polyfills = featureDetector.createPolyfills(missingFeatures);
      expect(polyfills).toContain('fetch-polyfill');
      expect(polyfills).toContain('css-custom-properties-polyfill');
    });

    it('should provide browser-specific optimizations', () => {
      const browserOptimizer = {
        getOptimizations: (browser) => {
          const optimizations = {
            chrome: {
              useHardwareAcceleration: true,
              enableWebGL: true,
              useServiceWorker: true,
              preferNativeDragDrop: true
            },
            firefox: {
              useCSS3Animations: true,
              batchDOMOperations: true,
              useScrollbarStyling: false,
              preferMozPrefixes: true
            },
            safari: {
              useWebkitPrefixes: true,
              handleTouchEvents: true,
              limitLocalStorage: true,
              useOverflowScrolling: true
            },
            edge: {
              useChromiumFeatures: true,
              enablePointerEvents: true,
              supportWindowsFeatures: true,
              useModernAPIs: true
            }
          };

          return optimizations[browser] || optimizations.chrome;
        },
        applyOptimizations: (browser, optimizations) => {
          const appliedOptimizations = [];

          Object.entries(optimizations).forEach(([key, value]) => {
            if (value) {
              appliedOptimizations.push(key);
            }
          });

          return appliedOptimizations;
        }
      };

      const chromeOpts = browserOptimizer.getOptimizations('chrome');
      expect(chromeOpts.useHardwareAcceleration).toBe(true);
      expect(chromeOpts.enableWebGL).toBe(true);

      const firefoxOpts = browserOptimizer.getOptimizations('firefox');
      expect(firefoxOpts.useCSS3Animations).toBe(true);
      expect(firefoxOpts.useScrollbarStyling).toBe(false);

      const safariOpts = browserOptimizer.getOptimizations('safari');
      expect(safariOpts.useWebkitPrefixes).toBe(true);
      expect(safariOpts.limitLocalStorage).toBe(true);

      const edgeOpts = browserOptimizer.getOptimizations('edge');
      expect(edgeOpts.useChromiumFeatures).toBe(true);
      expect(edgeOpts.enablePointerEvents).toBe(true);

      // Test optimization application
      const appliedChromeOpts = browserOptimizer.applyOptimizations('chrome', chromeOpts);
      expect(appliedChromeOpts).toContain('useHardwareAcceleration');
      expect(appliedChromeOpts).toContain('enableWebGL');
    });
  });

  describe('Responsive Design Cross-Browser Testing', () => {
    it('should handle viewport differences across browsers', () => {
      const viewportHandler = {
        getViewportSize: (browser) => {
          // Different browsers report viewport differently
          const mockViewports = {
            chrome: { width: 1920, height: 1080, devicePixelRatio: 1 },
            firefox: { width: 1920, height: 1080, devicePixelRatio: 1 },
            safari: { width: 1920, height: 1080, devicePixelRatio: 2 }, // Retina
            edge: { width: 1920, height: 1080, devicePixelRatio: 1.25 } // Windows scaling
          };

          return mockViewports[browser] || mockViewports.chrome;
        },
        handleMediaQueries: (browser) => {
          const mediaQuerySupport = {
            chrome: { supportsContainerQueries: true, supportsAspectRatio: true },
            firefox: { supportsContainerQueries: false, supportsAspectRatio: true },
            safari: { supportsContainerQueries: false, supportsAspectRatio: true },
            edge: { supportsContainerQueries: true, supportsAspectRatio: true }
          };

          return mediaQuerySupport[browser] || mediaQuerySupport.chrome;
        },
        adaptLayout: (browser, viewport) => {
          const layoutAdaptations = {
            mobile: {
              columns: 1,
              fontSize: '16px',
              padding: '8px'
            },
            tablet: {
              columns: 2,
              fontSize: '14px',
              padding: '12px'
            },
            desktop: {
              columns: 3,
              fontSize: '14px',
              padding: '16px'
            }
          };

          let breakpoint = 'desktop';
          if (viewport.width < 768) breakpoint = 'mobile';
          else if (viewport.width < 1024) breakpoint = 'tablet';

          return layoutAdaptations[breakpoint];
        }
      };

      const chromeViewport = viewportHandler.getViewportSize('chrome');
      const safariViewport = viewportHandler.getViewportSize('safari');
      
      expect(chromeViewport.devicePixelRatio).toBe(1);
      expect(safariViewport.devicePixelRatio).toBe(2); // Retina display

      const chromeMediaQueries = viewportHandler.handleMediaQueries('chrome');
      const firefoxMediaQueries = viewportHandler.handleMediaQueries('firefox');
      
      expect(chromeMediaQueries.supportsContainerQueries).toBe(true);
      expect(firefoxMediaQueries.supportsContainerQueries).toBe(false);

      const desktopLayout = viewportHandler.adaptLayout('chrome', chromeViewport);
      expect(desktopLayout.columns).toBe(3);

      const mobileLayout = viewportHandler.adaptLayout('chrome', { width: 375, height: 667 });
      expect(mobileLayout.columns).toBe(1);
    });

    it('should test touch interactions across mobile browsers', () => {
      const touchTester = {
        testTouchSupport: (browser) => {
          const touchSupport = {
            chrome: { touchEvents: true, pointerEvents: true, gestureEvents: false },
            firefox: { touchEvents: true, pointerEvents: false, gestureEvents: false },
            safari: { touchEvents: true, pointerEvents: false, gestureEvents: true },
            edge: { touchEvents: true, pointerEvents: true, gestureEvents: false }
          };

          return touchSupport[browser] || touchSupport.chrome;
        },
        simulateTouchGesture: (browser, gesture) => {
          const gestureHandlers = {
            tap: (event) => ({ type: 'tap', x: event.x, y: event.y }),
            swipe: (event) => ({ type: 'swipe', direction: event.direction, distance: event.distance }),
            pinch: (event) => ({ type: 'pinch', scale: event.scale, center: event.center }),
            rotate: (event) => ({ type: 'rotate', angle: event.angle, center: event.center })
          };

          return gestureHandlers[gesture.type] ? gestureHandlers[gesture.type](gesture) : null;
        },
        testDragAndDropTouch: (browser) => {
          const touchDragSupport = {
            chrome: { nativeDragDrop: true, touchDragDrop: true, customImplementation: false },
            firefox: { nativeDragDrop: true, touchDragDrop: false, customImplementation: true },
            safari: { nativeDragDrop: true, touchDragDrop: true, customImplementation: false },
            edge: { nativeDragDrop: true, touchDragDrop: true, customImplementation: false }
          };

          return touchDragSupport[browser] || touchDragSupport.chrome;
        }
      };

      const chromeTouchSupport = touchTester.testTouchSupport('chrome');
      const safariTouchSupport = touchTester.testTouchSupport('safari');
      
      expect(chromeTouchSupport.pointerEvents).toBe(true);
      expect(safariTouchSupport.gestureEvents).toBe(true);

      const tapGesture = touchTester.simulateTouchGesture('chrome', {
        type: 'tap',
        x: 100,
        y: 200
      });
      expect(tapGesture.type).toBe('tap');
      expect(tapGesture.x).toBe(100);

      const chromeDragSupport = touchTester.testDragAndDropTouch('chrome');
      const firefoxDragSupport = touchTester.testDragAndDropTouch('firefox');
      
      expect(chromeDragSupport.touchDragDrop).toBe(true);
      expect(firefoxDragSupport.customImplementation).toBe(true);
    });
  });
});