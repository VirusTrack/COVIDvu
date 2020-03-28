===============================
00001	#include <Python.h>
00002	#include "theano_mod_helper.h"
00003	#include "structmember.h"
00004	#include <sys/time.h>
00005	
00006	#if PY_VERSION_HEX >= 0x03000000
00007	#include "numpy/npy_3kcompat.h"
00008	#define PyCObject_AsVoidPtr  NpyCapsule_AsVoidPtr
00009	#define PyCObject_GetDesc  NpyCapsule_GetDesc
00010	#define PyCObject_Check NpyCapsule_Check
00011	#endif
00012	
00013	#ifndef Py_TYPE
00014	#define Py_TYPE(obj) obj->ob_type
00015	#endif
00016	
00017	/**
00018	
00019	TODO: 
00020	- Check max supported depth of recursion
00021	- CLazyLinker should add context information to errors caught during evaluation. Say what node we were on, add the traceback attached to the node.
00022	- Clear containers of fully-useed intermediate results if allow_gc is 1
00023	- Add timers for profiling
00024	- Add support for profiling space used.
00025	
00026	
00027	  */
00028	static double pytime(const struct timeval * tv)
00029	{
00030	  struct timeval t;
00031	  if (!tv)
00032	    {
00033	      tv = &t;
00034	      gettimeofday(&t, NULL);
00035	    }
00036	  return (double) tv->tv_sec + (double) tv->tv_usec / 1000000.0;
00037	}
00038	
00039	/**
00040	  Helper routine to convert a PyList of integers to a c array of integers.
00041	  */
00042	static int unpack_list_of_ssize_t(PyObject * pylist, Py_ssize_t **dst, Py_ssize_t *len,
00043	                                  const char* kwname)
00044	{
00045	  Py_ssize_t buflen, *buf;
00046	  if (!PyList_Check(pylist))
00047	    {
00048	      PyErr_Format(PyExc_TypeError, "%s must be list", kwname);
00049	      return -1;
00050	    }
00051	  assert (NULL == *dst);
00052	  *len = buflen = PyList_Size(pylist);
00053	  *dst = buf = (Py_ssize_t*)calloc(buflen, sizeof(Py_ssize_t));
00054	  assert(buf);
00055	  for (int ii = 0; ii < buflen; ++ii)
00056	    {
00057	      PyObject * el_i = PyList_GetItem(pylist, ii);
00058	      Py_ssize_t n_i = PyNumber_AsSsize_t(el_i, PyExc_IndexError);
00059	      if (PyErr_Occurred())
00060	        {
00061	          free(buf);
00062	          *dst = NULL;
00063	          return -1;
00064	        }
00065	      buf[ii] = n_i;
00066	    }
00067	  return 0;
00068	}
00069	
00070	/**
00071	
00072	  CLazyLinker
00073	
00074	
00075	  */
00076	typedef struct {
00077	    PyObject_HEAD
00078	    /* Type-specific fields go here. */
00079	    PyObject * nodes; // the python list of nodes
00080	    PyObject * thunks; // python list of thunks
00081	    PyObject * pre_call_clear; //list of cells to clear on call.
00082	    int allow_gc;
00083	    Py_ssize_t n_applies;
00084	    int n_vars;    // number of variables in the graph
00085	    int * var_computed; // 1 or 0 for every variable
00086	    PyObject ** var_computed_cells;
00087	    PyObject ** var_value_cells;
00088	    Py_ssize_t **dependencies; // list of vars dependencies for GC
00089	    Py_ssize_t *n_dependencies;
00090	
00091	    Py_ssize_t n_output_vars;
00092	    Py_ssize_t * output_vars; // variables that *must* be evaluated by call
00093	
00094	    int * is_lazy; // 1 or 0 for every thunk
00095	
00096	    Py_ssize_t * var_owner; // nodes[[var_owner[var_idx]]] is var[var_idx]->owner
00097	    int * var_has_owner; //  1 or 0
00098	
00099	    Py_ssize_t * node_n_inputs;
00100	    Py_ssize_t * node_n_outputs;
00101	    Py_ssize_t ** node_inputs;
00102	    Py_ssize_t ** node_outputs;
00103	    Py_ssize_t * node_inputs_outputs_base; // node_inputs and node_outputs point into this
00104	    Py_ssize_t * node_n_prereqs;
00105	    Py_ssize_t ** node_prereqs;
00106	
00107	    Py_ssize_t * update_storage; // input cells to update with the last outputs in output_vars
00108	    Py_ssize_t n_updates;
00109	
00110	    void ** thunk_cptr_fn;
00111	    void ** thunk_cptr_data;
00112	    PyObject * call_times;
00113	    PyObject * call_counts;
00114	    int do_timing;
00115	    int need_update_inputs;
00116	    int position_of_error; // -1 for no error, otw the index into `thunks` that failed.
00117	} CLazyLinker;
00118	
00119	
00120	static void
00121	CLazyLinker_dealloc(PyObject* _self)
00122	{
00123	  CLazyLinker* self = (CLazyLinker *) _self;
00124	  free(self->thunk_cptr_fn);
00125	  free(self->thunk_cptr_data);
00126	
00127	  free(self->is_lazy);
00128	
00129	  free(self->update_storage);
00130	
00131	  if (self->node_n_prereqs)
00132	    {
00133	      for (int i = 0; i < self->n_applies; ++i)
00134	        {
00135	          free(self->node_prereqs[i]);
00136	        }
00137	    }
00138	  free(self->node_n_prereqs);
00139	  free(self->node_prereqs);
00140	  free(self->node_inputs_outputs_base);
00141	  free(self->node_n_inputs);
00142	  free(self->node_n_outputs);
00143	  free(self->node_inputs);
00144	  free(self->node_outputs);
00145	
00146	  if (self->dependencies)
00147	    {
00148	      for (int i = 0; i < self->n_vars; ++i)
00149	        {
00150	          free(self->dependencies[i]);
00151	        }
00152	      free(self->dependencies);
00153	      free(self->n_dependencies);
00154	    }
00155	
00156	  free(self->var_owner);
00157	  free(self->var_has_owner);
00158	  free(self->var_computed);
00159	  if (self->var_computed_cells)
00160	    {
00161	      for (int i = 0; i < self->n_vars; ++i)
00162	        {
00163	          Py_DECREF(self->var_computed_cells[i]);
00164	          Py_DECREF(self->var_value_cells[i]);
00165	        }
00166	    }
00167	  free(self->var_computed_cells);
00168	  free(self->var_value_cells);
00169	  free(self->output_vars);
00170	
00171	  Py_XDECREF(self->nodes);
00172	  Py_XDECREF(self->thunks);
00173	  Py_XDECREF(self->call_times);
00174	  Py_XDECREF(self->call_counts);
00175	  Py_XDECREF(self->pre_call_clear);
00176	  Py_TYPE(self)->tp_free((PyObject*)self);
00177	}
00178	static PyObject *
00179	CLazyLinker_new(PyTypeObject *type, PyObject *args, PyObject *kwds)
00180	{
00181	    CLazyLinker *self;
00182	
00183	    self = (CLazyLinker *)type->tp_alloc(type, 0);
00184	    if (self != NULL) {
00185	      self->nodes = NULL;
00186	      self->thunks = NULL;
00187	      self->pre_call_clear = NULL;
00188	
00189	      self->allow_gc = 1;
00190	      self->n_applies = 0;
00191	      self->n_vars = 0;
00192	      self->var_computed = NULL;
00193	      self->var_computed_cells = NULL;
00194	      self->var_value_cells = NULL;
00195	      self->dependencies = NULL;
00196	      self->n_dependencies = NULL;
00197	
00198	      self->n_output_vars = 0;
00199	      self->output_vars = NULL;
00200	
00201	      self->is_lazy = NULL;
00202	
00203	      self->var_owner = NULL;
00204	      self->var_has_owner = NULL;
00205	
00206	      self->node_n_inputs = NULL;
00207	      self->node_n_outputs = NULL;
00208	      self->node_inputs = NULL;
00209	      self->node_outputs = NULL;
00210	      self->node_inputs_outputs_base = NULL;
00211	      self->node_prereqs = NULL;
00212	      self->node_n_prereqs = NULL;
00213	
00214	      self->update_storage = NULL;
00215	      self->n_updates = 0;
00216	
00217	      self->thunk_cptr_data = NULL;
00218	      self->thunk_cptr_fn = NULL;
00219	      self->call_times = NULL;
00220	      self->call_counts = NULL;
00221	      self->do_timing = 0;
00222	
00223	      self->need_update_inputs = 0;
00224	      self->position_of_error = -1;
00225	    }
00226	    return (PyObject *)self;
00227	}
00228	
00229	static int
00230	CLazyLinker_init(CLazyLinker *self, PyObject *args, PyObject *kwds)
00231	{
00232	    static char *kwlist[] = {
00233	      (char*)"nodes",
00234	      (char*)"thunks",
00235	      (char*)"pre_call_clear",
00236	      (char*)"allow_gc",
00237	      (char*)"call_counts",
00238	      (char*)"call_times",
00239	      (char*)"compute_map_list",
00240	      (char*)"storage_map_list",
00241	      (char*)"base_input_output_list",
00242	      (char*)"node_n_inputs",
00243	      (char*)"node_n_outputs",
00244	      (char*)"node_input_offset",
00245	      (char*)"node_output_offset",
00246	      (char*)"var_owner",
00247	      (char*)"is_lazy_list",
00248	      (char*)"output_vars",
00249	      (char*)"node_prereqs",
00250	      (char*)"node_output_size",
00251	      (char*)"update_storage",
00252	      (char*)"dependencies",
00253	      NULL};
00254	
00255	    PyObject *compute_map_list=NULL,
00256	             *storage_map_list=NULL,
00257	             *base_input_output_list=NULL,
00258	             *node_n_inputs=NULL,
00259	             *node_n_outputs=NULL,
00260	             *node_input_offset=NULL,
00261	             *node_output_offset=NULL,
00262	             *var_owner=NULL,
00263	             *is_lazy=NULL,
00264	             *output_vars=NULL,
00265	             *node_prereqs=NULL,
00266	             *node_output_size=NULL,
00267	             *update_storage=NULL,
00268	             *dependencies=NULL;
00269	
00270	    assert(!self->nodes);
00271	    if (! PyArg_ParseTupleAndKeywords(args, kwds, "OOOiOOOOOOOOOOOOOOOO", kwlist,
00272	                                      &self->nodes,
00273	                                      &self->thunks,
00274	                                      &self->pre_call_clear,
00275	                                      &self->allow_gc,
00276	                                      &self->call_counts,
00277	                                      &self->call_times,
00278	                                      &compute_map_list,
00279	                                      &storage_map_list,
00280	                                      &base_input_output_list,
00281	                                      &node_n_inputs,
00282	                                      &node_n_outputs,
00283	                                      &node_input_offset,
00284	                                      &node_output_offset,
00285	                                      &var_owner,
00286	                                      &is_lazy,
00287	                                      &output_vars,
00288	                                      &node_prereqs,
00289	                                      &node_output_size,
00290	                                      &update_storage,
00291	                                      &dependencies
00292	                                      ))
00293	        return -1;
00294	    Py_INCREF(self->nodes);
00295	    Py_INCREF(self->thunks);
00296	    Py_INCREF(self->pre_call_clear);
00297	    Py_INCREF(self->call_counts);
00298	    Py_INCREF(self->call_times);
00299	
00300	    Py_ssize_t n_applies = PyList_Size(self->nodes);
00301	
00302	    self->n_applies = n_applies;
00303	    self->n_vars = PyList_Size(var_owner);
00304	
00305	    if (PyList_Size(self->thunks) != n_applies) return -1;
00306	    if (PyList_Size(self->call_counts) != n_applies) return -1;
00307	    if (PyList_Size(self->call_times) != n_applies) return -1;
00308	
00309	    // allocated and initialize thunk_cptr_data and thunk_cptr_fn
00310	    if (n_applies)
00311	      {
00312	        self->thunk_cptr_data = (void**)calloc(n_applies, sizeof(void*));
00313	        self->thunk_cptr_fn = (void**)calloc(n_applies, sizeof(void*));
00314	        self->is_lazy = (int*)calloc(n_applies, sizeof(int));
00315	        self->node_prereqs = (Py_ssize_t**)calloc(n_applies, sizeof(Py_ssize_t*));
00316	        self->node_n_prereqs = (Py_ssize_t*)calloc(n_applies, sizeof(Py_ssize_t));
00317	        assert(self->node_prereqs);
00318	        assert(self->node_n_prereqs);
00319	        assert(self->is_lazy);
00320	        assert(self->thunk_cptr_fn);
00321	        assert(self->thunk_cptr_data);
00322	
00323	        for (int i = 0; i < n_applies; ++i)
00324	          {
00325	            PyObject * thunk = PyList_GetItem(self->thunks, i);
00326	            //thunk is borrowed
00327	            if (PyObject_HasAttrString(thunk, "cthunk"))
00328	              {
00329	                PyObject * cthunk = PyObject_GetAttrString(thunk, "cthunk");
00330	                //new reference
00331	                assert (cthunk && PyCObject_Check(cthunk));
00332	                self->thunk_cptr_fn[i] = PyCObject_AsVoidPtr(cthunk);
00333	                self->thunk_cptr_data[i] = PyCObject_GetDesc(cthunk);
00334	                Py_DECREF(cthunk);
00335	                // cthunk is kept alive by membership in self->thunks
00336	              }
00337	
00338	            PyObject * el_i = PyList_GetItem(is_lazy, i);
00339	            self->is_lazy[i] = PyNumber_AsSsize_t(el_i, NULL);
00340	
00341	            /* now get the prereqs */
00342	            el_i = PyList_GetItem(node_prereqs, i);
00343	            assert (PyList_Check(el_i));
00344	            self->node_n_prereqs[i] = PyList_Size(el_i);
00345	            if (self->node_n_prereqs[i])
00346	              {
00347	                self->node_prereqs[i] = (Py_ssize_t*)malloc(
00348	                              PyList_Size(el_i)*sizeof(Py_ssize_t));
00349	                for (int j = 0; j < PyList_Size(el_i); ++j)
00350	                  {
00351	                    PyObject * el_ij = PyList_GetItem(el_i, j);
00352	                    Py_ssize_t N = PyNumber_AsSsize_t(el_ij, PyExc_IndexError);
00353	                    if (PyErr_Occurred())
00354	                      return -1;
00355	                    // N < n. variables
00356	                    assert(N < PyList_Size(var_owner));
00357	                    self->node_prereqs[i][j] = N;
00358	                  }
00359	              }
00360	          }
00361	      }
00362	    if (PyList_Check(base_input_output_list))
00363	      {
00364	        Py_ssize_t n_inputs_outputs_base = PyList_Size(base_input_output_list);
00365	        self->node_inputs_outputs_base = (Py_ssize_t*)calloc(n_inputs_outputs_base,sizeof(Py_ssize_t));
00366	        assert(self->node_inputs_outputs_base);
00367	        for (int i = 0; i < n_inputs_outputs_base; ++i)
00368	          {
00369	            PyObject *el_i = PyList_GetItem(base_input_output_list, i);
00370	            Py_ssize_t idx = PyNumber_AsSsize_t(el_i, PyExc_IndexError);
00371	            if (PyErr_Occurred()) return -1;
00372	            self->node_inputs_outputs_base[i] = idx;
00373	          }
00374	        self->node_n_inputs = (Py_ssize_t*)calloc(n_applies,sizeof(Py_ssize_t));
00375	        assert(self->node_n_inputs);
00376	        self->node_n_outputs = (Py_ssize_t*)calloc(n_applies,sizeof(Py_ssize_t));
00377	        assert(self->node_n_outputs);
00378	        self->node_inputs = (Py_ssize_t**)calloc(n_applies,sizeof(Py_ssize_t*));
00379	        assert(self->node_inputs);
00380	        self->node_outputs = (Py_ssize_t**)calloc(n_applies,sizeof(Py_ssize_t*));
00381	        assert(self->node_outputs);
00382	        for (int i = 0; i < n_applies; ++i)
00383	          {
00384	            Py_ssize_t N;
00385	            N = PyNumber_AsSsize_t(PyList_GetItem(node_n_inputs, i),PyExc_IndexError);
00386	            if (PyErr_Occurred()) return -1;
00387	            assert (N <= n_inputs_outputs_base);
00388	            self->node_n_inputs[i] = N;
00389	            N = PyNumber_AsSsize_t(PyList_GetItem(node_n_outputs, i),PyExc_IndexError);
00390	            if (PyErr_Occurred()) return -1;
00391	            assert (N <= n_inputs_outputs_base);
00392	            self->node_n_outputs[i] = N;
00393	            N = PyNumber_AsSsize_t(PyList_GetItem(node_input_offset, i),PyExc_IndexError);
00394	            if (PyErr_Occurred()) return -1;
00395	            assert (N <= n_inputs_outputs_base);
00396	            self->node_inputs[i] = &self->node_inputs_outputs_base[N];
00397	            N = PyNumber_AsSsize_t(PyList_GetItem(node_output_offset, i),PyExc_IndexError);
00398	            if (PyErr_Occurred()) return -1;
00399	            assert (N <= n_inputs_outputs_base);
00400	            self->node_outputs[i] = &self->node_inputs_outputs_base[N];
00401	          }
00402	      }
00403	    else
00404	      {
00405	        PyErr_SetString(PyExc_TypeError, "base_input_output_list must be list");
00406	        return -1;
00407	      }
00408	
00409	    // allocation for var_owner
00410	    if (PyList_Check(var_owner))
00411	      {
00412	        self->var_owner = (Py_ssize_t*)calloc(self->n_vars,sizeof(Py_ssize_t));
00413	        self->var_has_owner = (int*)calloc(self->n_vars,sizeof(int));
00414	        self->var_computed = (int*)calloc(self->n_vars,sizeof(int));
00415	        self->var_computed_cells = (PyObject**)calloc(self->n_vars,sizeof(PyObject*));
00416	        self->var_value_cells = (PyObject**)calloc(self->n_vars,sizeof(PyObject*));
00417	        for (int i = 0; i < self->n_vars; ++i)
00418	          {
00419	            PyObject * el_i = PyList_GetItem(var_owner, i);
00420	            if (el_i == Py_None)
00421	              {
00422	                self->var_has_owner[i] = 0;
00423	              }
00424	            else
00425	              {
00426	                Py_ssize_t N = PyNumber_AsSsize_t(el_i, PyExc_IndexError);
00427	                if (PyErr_Occurred()) return -1;
00428	                assert (N <= n_applies);
00429	                self->var_owner[i] = N;
00430	                self->var_has_owner[i] = 1;
00431	              }
00432	            self->var_computed_cells[i] = PyList_GetItem(compute_map_list, i);
00433	            Py_INCREF(self->var_computed_cells[i]);
00434	            self->var_value_cells[i] = PyList_GetItem(storage_map_list, i);
00435	            Py_INCREF(self->var_value_cells[i]);
00436	          }
00437	      }
00438	    else
00439	      {
00440	        PyErr_SetString(PyExc_TypeError, "var_owner must be list");
00441	        return -1;
00442	      }
00443	
00444	    if (dependencies != Py_None)
00445	      {
00446	        self->dependencies = (Py_ssize_t**)calloc(self->n_vars, sizeof(Py_ssize_t *));
00447	        self->n_dependencies = (Py_ssize_t*)calloc(self->n_vars, sizeof(Py_ssize_t));
00448	        assert(self->dependencies);
00449	        assert(self->n_dependencies);
00450	
00451	        for (int i = 0; i < self->n_vars; ++i)
00452	          {
00453	            PyObject *tmp = PyList_GetItem(dependencies, i);
00454	            // refcounting - tmp is borrowed
00455	            if (unpack_list_of_ssize_t(tmp, &self->dependencies[i], &self->n_dependencies[i],
00456	                                       "dependencies"))
00457	              return -1;
00458	          }
00459	      }
00460	
00461	    if (unpack_list_of_ssize_t(output_vars, &self->output_vars, &self->n_output_vars,
00462	                               "output_vars"))
00463	      return -1;
00464	    for (int i = 0; i < self->n_output_vars; ++i)
00465	      {
00466	        assert(self->output_vars[i] < self->n_vars);
00467	      }
00468	    if (unpack_list_of_ssize_t(update_storage, &self->update_storage, &self->n_updates,
00469	                               "updates_storage"))
00470	      return -1;
00471	    return 0;
00472	}
00473	static void set_position_of_error(CLazyLinker * self, int owner_idx)
00474	{
00475	  if (self->position_of_error == -1)
00476	    {
00477	      self->position_of_error = owner_idx;
00478	    }
00479	}
00480	static PyObject * pycall(CLazyLinker * self, Py_ssize_t node_idx, int verbose)
00481	{
00482	  // call thunk to see which inputs it wants
00483	  PyObject * thunk = PyList_GetItem(self->thunks, node_idx);
00484	  // refcounting - thunk is borrowed
00485	  PyObject * rval = NULL;
00486	  if (self->do_timing)
00487	    {
00488	      double t0 = pytime(NULL);
00489	      if (verbose) fprintf(stderr, "calling via Python (node %i)\n", (int)node_idx);
00490	      rval = PyObject_CallObject(thunk, NULL);
00491	      if (rval)
00492	        {
00493	          double t1 = pytime(NULL);
00494	          double ti = PyFloat_AsDouble(
00495	                         PyList_GetItem(self->call_times, node_idx));
00496	          PyList_SetItem(self->call_times, node_idx,
00497	                         PyFloat_FromDouble(t1 - t0 + ti));
00498	          PyObject * count = PyList_GetItem(self->call_counts, node_idx);
00499	          long icount = PyInt_AsLong(count);
00500	          PyList_SetItem(self->call_counts, node_idx,
00501	                         PyInt_FromLong(icount + 1));
00502	      }
00503	    }
00504	  else
00505	    {
00506	      if (verbose)
00507	        {
00508	          fprintf(stderr, "calling via Python (node %i)\n", (int)node_idx);
00509	        }
00510	      rval = PyObject_CallObject(thunk, NULL);
00511	    }
00512	  return rval;
00513	}
00514	static int c_call(CLazyLinker * self, Py_ssize_t node_idx, int verbose)
00515	{
00516	  void * ptr_addr = self->thunk_cptr_fn[node_idx];
00517	  int (*fn)(void*) = (int (*)(void*))(ptr_addr);
00518	  if (verbose) fprintf(stderr, "calling non-lazy shortcut (node %i)\n", (int)node_idx);
00519	  int err = 0;
00520	  if (self->do_timing)
00521	    {
00522	      double t0 = pytime(NULL);
00523	      err = fn(self->thunk_cptr_data[node_idx]);
00524	      double t1 = pytime(NULL);
00525	      double ti = PyFloat_AsDouble(PyList_GetItem(self->call_times, node_idx));
00526	      PyList_SetItem(self->call_times, node_idx, PyFloat_FromDouble(t1 - t0 + ti));
00527	      PyObject * count = PyList_GetItem(self->call_counts, node_idx);
00528	      long icount = PyInt_AsLong(count);
00529	      PyList_SetItem(self->call_counts, node_idx, PyInt_FromLong(icount+1));
00530	    }
00531	  else
00532	    {
00533	      err = fn(self->thunk_cptr_data[node_idx]);
00534	    }
00535	
00536	  if (err)
00537	    {
00538	      // cast the argument to a PyList (as described near line 226 of cc.py)
00539	      PyObject * __ERROR = ((PyObject**)self->thunk_cptr_data[node_idx])[0];
00540	      assert (PyList_Check(__ERROR));
00541	      assert (PyList_Size(__ERROR) == 3);
00542	      PyObject * err_type = PyList_GetItem(__ERROR, 0); //stolen ref
00543	      PyObject * err_msg = PyList_GetItem(__ERROR, 1); //stolen ref
00544	      PyObject * err_trace = PyList_GetItem(__ERROR, 2); //stolen ref
00545	      PyList_SET_ITEM(__ERROR, 0, Py_None); Py_INCREF(Py_None); //clobbers old ref
00546	      PyList_SET_ITEM(__ERROR, 1, Py_None); Py_INCREF(Py_None); //clobbers old ref
00547	      PyList_SET_ITEM(__ERROR, 2, Py_None); Py_INCREF(Py_None); //clobbers old ref
00548	
00549	      assert(!PyErr_Occurred()); // because CLinker hid the exception in __ERROR aka data
00550	      PyErr_Restore(err_type, err_msg, err_trace); //steals refs to args
00551	    }
00552	  if (err) set_position_of_error(self, node_idx);
00553	  return err;
00554	}
00555	static
00556	int lazy_rec_eval(CLazyLinker * self, Py_ssize_t var_idx, PyObject*one, PyObject*zero)
00557	{
00558	  PyObject *rval = NULL;
00559	  int verbose = 0;
00560	  int err = 0;
00561	
00562	  if (verbose) fprintf(stderr, "lazy_rec computing %i\n", (int)var_idx);
00563	
00564	  if (self->var_computed[var_idx] || !self->var_has_owner[var_idx])
00565	    return 0;
00566	
00567	  Py_ssize_t owner_idx = self->var_owner[var_idx];
00568	
00569	  // STEP 1: compute the pre-requirements of the node
00570	  // Includes input nodes for non-lazy ops.
00571	  for (int i = 0; i < self->node_n_prereqs[owner_idx]; ++i)
00572	    {
00573	      Py_ssize_t prereq_idx = self->node_prereqs[owner_idx][i];
00574	      if (!self->var_computed[prereq_idx])
00575	        {
00576	          err = lazy_rec_eval(self, prereq_idx, one, zero);
00577	          if (err) return err;
00578	        }
00579	      assert (self->var_computed[prereq_idx]);
00580	    }
00581	
00582	  // STEP 2: compute the node itself
00583	  if (self->is_lazy[owner_idx])
00584	    {
00585	      // update the compute_map cells corresponding to the inputs of this thunk
00586	      for (int i = 0; i < self->node_n_inputs[owner_idx]; ++i)
00587	        {
00588	          int in_idx = self->node_inputs[owner_idx][i];
00589	          if (self->var_computed[in_idx])
00590	            {
00591	              Py_INCREF(one);
00592	              err = PyList_SetItem(self->var_computed_cells[in_idx], 0, one);
00593	            }
00594	          else
00595	            {
00596	              Py_INCREF(zero);
00597	              err = PyList_SetItem(self->var_computed_cells[in_idx], 0, zero);
00598	            }
00599	          if (err) goto fail;
00600	        }
00601	
00602	      rval = pycall(self, owner_idx, verbose);
00603	      // refcounting - rval is new ref
00604	      //TODO: to prevent infinite loops
00605	      // - consider check that a thunk does not ask for an input that is already computed
00606	      if (rval == NULL)
00607	        {
00608	          assert (PyErr_Occurred());
00609	          err = 1;
00610	          goto fail;
00611	        }
00612	
00613	      //update the computed-ness of any output cells
00614	      for (int i = 0; i < self->node_n_outputs[owner_idx]; ++i)
00615	        {
00616	          int out_idx = self->node_outputs[owner_idx][i];
00617	          PyObject * el_i = PyList_GetItem(self->var_computed_cells[out_idx], 0);
00618	          Py_ssize_t N = PyNumber_AsSsize_t(el_i, PyExc_IndexError);
00619	          if (PyErr_Occurred())
00620	            {
00621	              err = -1;
00622	              goto pyfail;
00623	            }
00624	          assert (N==0 || N==1);
00625	          self->var_computed[out_idx] = N;
00626	        }
00627	      if (!self->var_computed[var_idx])
00628	        {
00629	          /*
00630	           * If self is not computed after the call, this means that some
00631	           * inputs are needed.  Compute the ones on the returned list
00632	           * and try to compute the current node again (with recursive call).
00633	           * This allows a node to request more nodes more than once before
00634	           * finally yielding a result.
00635	           */
00636	          if (!PyList_Check(rval))
00637	            {
00638	              //TODO: More helpful error to help find *which node* made this
00639	              // bad thunk
00640	              PyErr_SetString(PyExc_TypeError,
00641	                              "lazy thunk should return a list");
00642	              err = 1;
00643	              goto pyfail;
00644	            }
00645	
00646	          if (!PyList_Size(rval))
00647	            {
00648	              PyErr_SetString(PyExc_ValueError,
00649	                              "lazy thunk returned empty list without computing output");
00650	              err = 1;
00651	              goto pyfail;
00652	            }
00653	
00654	          for (int i = 0; i < PyList_Size(rval); ++i)
00655	            {
00656	              PyObject * el_i = PyList_GetItem(rval, i);
00657	              Py_ssize_t N = PyNumber_AsSsize_t(el_i, PyExc_IndexError);
00658	              if (PyErr_Occurred())
00659	                {
00660	                  err = 1;
00661	                  goto pyfail;
00662	                }
00663	              assert (N <= self->node_n_inputs[owner_idx]);
00664	              Py_ssize_t input_idx = self->node_inputs[owner_idx][N];
00665	              err = lazy_rec_eval(self, input_idx, one, zero);
00666	              if (err) goto pyfail;
00667	            }
00668	
00669	          Py_DECREF(rval);
00670	          /*
00671	           * We intentionally skip all the end-of-function processing
00672	           * (mark outputs, GC) as it will be performed by the call
00673	           * that actually manages to compute the result.
00674	           */
00675	          return lazy_rec_eval(self, var_idx, one, zero);
00676	        }
00677	
00678	      Py_DECREF(rval);
00679	    }
00680	  else //owner is not a lazy op. Ensure all intputs are evaluated.
00681	    {
00682	      // loop over inputs to owner
00683	      // call lazy_rec_eval on each one that is not computed.
00684	      // if there's an error, pass it up the stack
00685	      for (int i = 0; i < self->node_n_inputs[owner_idx]; ++i)
00686	        {
00687	          Py_ssize_t input_idx = self->node_inputs[owner_idx][i];
00688	          if (!self->var_computed[input_idx])
00689	            {
00690	              err = lazy_rec_eval(self, input_idx, one, zero);
00691	              if (err) return err;
00692	            }
00693	          assert (self->var_computed[input_idx]);
00694	        }
00695	
00696	      // call the thunk for this owner.
00697	      if (self->thunk_cptr_fn[owner_idx])
00698	        {
00699	          err = c_call(self, owner_idx, verbose);
00700	          if (err) goto fail;
00701	        }
00702	      else
00703	        {
00704	          rval = pycall(self, owner_idx, verbose);
00705	          //rval is new ref
00706	          if (rval) //pycall returned normally (no exception)
00707	            {
00708	              if (rval == Py_None)
00709	                {
00710	                  Py_DECREF(rval); //ignore a return of None
00711	                }
00712	              else if (PyList_Check(rval))
00713	                {
00714	                  PyErr_SetString(PyExc_TypeError,
00715	                                  "non-lazy thunk should return None, not list");
00716	                  err = 1;
00717	                  goto pyfail;
00718	                }
00719	              else // don't know what it returned, but it wasn't right.
00720	                {
00721	                  PyErr_SetObject(PyExc_TypeError, rval);
00722	                  err = 1;
00723	                  // We don't release rval since we put it in the error above
00724	                  goto fail;
00725	                }
00726	            }
00727	          else // pycall returned NULL (internal error)
00728	            {
00729	              err = 1;
00730	              goto fail;
00731	            }
00732	        }
00733	    }
00734	
00735	  // loop over all outputs and mark them as computed
00736	  for (int i = 0; i < self->node_n_outputs[owner_idx]; ++i)
00737	    {
00738	      self->var_computed[self->node_outputs[owner_idx][i]] = 1;
00739	    }
00740	
00741	  // Free vars that are not needed anymore
00742	  if (self->allow_gc)
00743	    {
00744	      for (int i = 0; i < self->node_n_inputs[owner_idx]; ++i)
00745	        {
00746	          int cleanup = 1;
00747	          Py_ssize_t i_idx = self->node_inputs[owner_idx][i];
00748	          if (!self->var_has_owner[i_idx])
00749	            continue;
00750	
00751	          for (int j = 0; j < self->n_output_vars; ++j)
00752	            {
00753	              if (i_idx == self->output_vars[j])
00754	                {
00755	                  cleanup = 0;
00756	                  break;
00757	                }
00758	            }
00759	          if (!cleanup) continue;
00760	
00761	          for (int j = 0; j < self->n_dependencies[i_idx]; ++j)
00762	            {
00763	              if (!self->var_computed[self->dependencies[i_idx][j]])
00764	                {
00765	                  cleanup = 0;
00766	                  break;
00767	                }
00768	            }
00769	          if (!cleanup) continue;
00770	
00771	          Py_INCREF(Py_None);
00772	          err = PyList_SetItem(self->var_value_cells[i_idx], 0, Py_None);
00773	//See the Stack gc implementation for why we change it to 2 and not 0.
00774	          self->var_computed[i_idx] = 2;
00775	          if (err) goto fail;
00776	        }
00777	    }
00778	
00779	  return 0;
00780	 pyfail:
00781	  Py_DECREF(rval);
00782	 fail:
00783	  set_position_of_error(self, owner_idx);
00784	  return err;
00785	}
00786	
00787	static PyObject *
00788	CLazyLinker_call(PyObject *_self, PyObject *args, PyObject *kwds)
00789	{
00790	  CLazyLinker * self = (CLazyLinker*)_self;
00791	  static char *kwlist[] = {
00792	    (char *)"time_thunks",
00793	    (char *)"n_calls",
00794	    (char *)"output_subset",
00795	    NULL};
00796	  int n_calls=1;
00797	  PyObject *output_subset_ptr = NULL;
00798	  if (! PyArg_ParseTupleAndKeywords(args, kwds, "|iiO", kwlist,
00799	                                    &self->do_timing,
00800	                                    &n_calls,
00801	                                    &output_subset_ptr))
00802	    return NULL;
00803	
00804	  int err = 0;
00805	  // parse an output_subset list
00806	  // it is stored as a bool list of length n_output_vars: calculate a var or not
00807	  char *output_subset = NULL;
00808	  int output_subset_size = -1;
00809	  if (output_subset_ptr != NULL)
00810	    {
00811	      if (! PyList_Check(output_subset_ptr))
00812	        {
00813	          err = 1;
00814	          PyErr_SetString(PyExc_RuntimeError, "Output_subset is not a list");
00815	        }
00816	      else
00817	        {
00818	          output_subset_size = PyList_Size(output_subset_ptr);
00819	          output_subset = (char*)calloc(self->n_output_vars, sizeof(char));
00820	          for (int it = 0; it < output_subset_size; ++it)
00821	            {
00822	              PyObject *elem = PyList_GetItem(output_subset_ptr, it);
00823	              if (! PyInt_Check(elem))
00824	                {
00825	                  err = 1;
00826	                  PyErr_SetString(PyExc_RuntimeError, "Some elements of output_subset list are not int");
00827	                }
00828	              output_subset[PyInt_AsLong(elem)] = 1;
00829	            }
00830	        }
00831	    }
00832	
00833	  self->position_of_error = -1;
00834	  // create constants used to fill the var_compute_cells
00835	  PyObject * one = PyInt_FromLong(1);
00836	  PyObject * zero = PyInt_FromLong(0);
00837	
00838	  // pre-allocate our return value
00839	  Py_INCREF(Py_None);
00840	  PyObject * rval = Py_None;
00841	  //clear storage of pre_call_clear elements
00842	  for (int call_i = 0; call_i < n_calls && (!err); ++call_i)
00843	    {
00844	      Py_ssize_t n_pre_call_clear = PyList_Size(self->pre_call_clear);
00845	      assert(PyList_Check(self->pre_call_clear));
00846	      for (int i = 0; i < n_pre_call_clear; ++i)
00847	        {
00848	          PyObject * el_i = PyList_GetItem(self->pre_call_clear, i);
00849	          Py_INCREF(Py_None);
00850	          PyList_SetItem(el_i, 0, Py_None);
00851	        }
00852	      //clear the computed flag out of all non-input vars
00853	      for (int i = 0; i < self->n_vars; ++i)
00854	        {
00855	          self->var_computed[i] = !self->var_has_owner[i];
00856	          if (self->var_computed[i])
00857	            {
00858	              Py_INCREF(one);
00859	              PyList_SetItem(self->var_computed_cells[i], 0, one);
00860	            }
00861	          else
00862	            {
00863	              Py_INCREF(zero);
00864	              PyList_SetItem(self->var_computed_cells[i], 0, zero);
00865	            }
00866	        }
00867	
00868	      int first_updated = self->n_output_vars - self->n_updates;
00869	      for (int i = 0; i < self->n_output_vars && (!err); ++i)
00870	        {
00871	          if (i >= first_updated || output_subset == NULL || output_subset[i] == 1)
00872	            {
00873	              err = lazy_rec_eval(self, self->output_vars[i], one, zero);
00874	            }
00875	        }
00876	
00877	      if (!err)
00878	        {
00879	          // save references to outputs prior to updating storage containers
00880	          assert (self->n_output_vars >= self->n_updates);
00881	          Py_DECREF(rval);
00882	          rval = PyList_New(self->n_output_vars);
00883	          for (int i = 0; i < (self->n_output_vars); ++i)
00884	            {
00885	              Py_ssize_t src = self->output_vars[i];
00886	              PyObject * item = PyList_GetItem(self->var_value_cells[src], 0);
00887	              if ((output_subset == NULL || output_subset[i]) &&
00888	                  self->var_computed[src] != 1)
00889	                {
00890	                  err = 1;
00891	                  PyErr_Format(PyExc_AssertionError,
00892	                               "The compute map of output %d should contain "
00893	                               "1 at the end of execution, not %d.",
00894	                               i, self->var_computed[src]);
00895	                  break;
00896	                }
00897	              Py_INCREF(item);
00898	              PyList_SetItem(rval, i, item);
00899	            }
00900	        }
00901	
00902	      if (!err)
00903	        {
00904	          // Update the inputs that have an update rule
00905	          for (int i = 0; i < self->n_updates; ++i)
00906	            {
00907	              PyObject* tmp = PyList_GetItem(rval, self->n_output_vars - self->n_updates + i);
00908	              Py_INCREF(tmp);
00909	              Py_ssize_t dst = self->update_storage[i];
00910	              PyList_SetItem(self->var_value_cells[dst], 0, tmp);
00911	            }
00912	        }
00913	    }
00914	
00915	  /*
00916	    Clear everything that is left and not an output. This is needed
00917	    for lazy evaluation since the current GC algo is too conservative
00918	    with lazy graphs.
00919	  */
00920	  if (self->allow_gc && !err)
00921	    {
00922	      for (Py_ssize_t i = 0; i < self->n_vars; ++i)
00923	        {
00924	          int do_cleanup = 1;
00925	          if (!self->var_has_owner[i] || !self->var_computed[i])
00926	            continue;
00927	          for (int j = 0; j < self->n_output_vars; ++j)
00928	            {
00929	              if (i == self->output_vars[j])
00930	                {
00931	                  do_cleanup = 0;
00932	                  break;
00933	                }
00934	            }
00935	          if (!do_cleanup)
00936	            continue;
00937	          Py_INCREF(Py_None);
00938	          PyList_SetItem(self->var_value_cells[i], 0, Py_None);
00939	        }
00940	    }
00941	  if (output_subset != NULL)
00942	    free(output_subset);
00943	
00944	  Py_DECREF(one);
00945	  Py_DECREF(zero);
00946	  if (err)
00947	    {
00948	      Py_DECREF(rval);
00949	      return NULL;
00950	    }
00951	  return rval;
00952	}
00953	
00954	#if 0
00955	static PyMethodDef CLazyLinker_methods[] = {
00956	    {
00957	      //"name", (PyCFunction)CLazyLinker_accept, METH_VARARGS, "Return the name, combining the first and last name"
00958	    },
00959	    {NULL}  /* Sentinel */
00960	};
00961	#endif
00962	
00963	
00964	static PyObject *
00965	CLazyLinker_get_allow_gc(CLazyLinker *self, void *closure)
00966	{
00967	    return PyBool_FromLong(self->allow_gc);
00968	}
00969	
00970	static int
00971	CLazyLinker_set_allow_gc(CLazyLinker *self, PyObject *value, void *closure)
00972	{
00973	  if(!PyBool_Check(value))
00974	    return -1;
00975	
00976	  if (value == Py_True)
00977	    self->allow_gc = true;
00978	  else
00979	    self->allow_gc = false;
00980	  return 0;
00981	}
00982	
00983	static PyGetSetDef CLazyLinker_getset[] = {
00984	  {(char*)"allow_gc",
00985	   (getter)CLazyLinker_get_allow_gc,
00986	   (setter)CLazyLinker_set_allow_gc,
00987	   (char*)"do this function support allow_gc",
00988	   NULL},
00989	  {NULL, NULL, NULL, NULL}  /* Sentinel */
00990	};
00991	static PyMemberDef CLazyLinker_members[] = {
00992	    {(char*)"nodes", T_OBJECT_EX, offsetof(CLazyLinker, nodes), 0,
00993	     (char*)"list of nodes"},
00994	    {(char*)"thunks", T_OBJECT_EX, offsetof(CLazyLinker, thunks), 0,
00995	     (char*)"list of thunks in program"},
00996	    {(char*)"call_counts", T_OBJECT_EX, offsetof(CLazyLinker, call_counts), 0,
00997	     (char*)"number of calls of each thunk"},
00998	    {(char*)"call_times", T_OBJECT_EX, offsetof(CLazyLinker, call_times), 0,
00999	     (char*)"total runtime in each thunk"},
01000	    {(char*)"position_of_error", T_INT, offsetof(CLazyLinker, position_of_error), 0,
01001	     (char*)"position of failed thunk"},
01002	    {(char*)"time_thunks", T_INT, offsetof(CLazyLinker, do_timing), 0,
01003	     (char*)"bool: nonzero means call will time thunks"},
01004	    {(char*)"need_update_inputs", T_INT, offsetof(CLazyLinker, need_update_inputs), 0,
01005	     (char*)"bool: nonzero means Function.__call__ must implement update mechanism"},
01006	    {NULL}  /* Sentinel */
01007	};
01008	
01009	static PyTypeObject lazylinker_ext_CLazyLinkerType = {
01010	#if defined(NPY_PY3K)
01011	    PyVarObject_HEAD_INIT(NULL, 0)
01012	#else
01013	    PyObject_HEAD_INIT(NULL)
01014	    0,                         /*ob_size*/
01015	#endif
01016	    "lazylinker_ext.CLazyLinker",             /*tp_name*/
01017	    sizeof(CLazyLinker), /*tp_basicsize*/
01018	    0,                         /*tp_itemsize*/
01019	    CLazyLinker_dealloc,       /*tp_dealloc*/
01020	    0,                         /*tp_print*/
01021	    0,                         /*tp_getattr*/
01022	    0,                         /*tp_setattr*/
01023	    0,                         /*tp_compare*/
01024	    0,                         /*tp_repr*/
01025	    0,                         /*tp_as_number*/
01026	    0,                         /*tp_as_sequence*/
01027	    0,                         /*tp_as_mapping*/
01028	    0,                         /*tp_hash */
01029	    CLazyLinker_call,          /*tp_call*/
01030	    0,                         /*tp_str*/
01031	    0,                         /*tp_getattro*/
01032	    0,                         /*tp_setattro*/
01033	    0,                         /*tp_as_buffer*/
01034	    Py_TPFLAGS_DEFAULT|Py_TPFLAGS_BASETYPE,        /*tp_flags*/
01035	    "CLazyLinker object",      /* tp_doc */
01036	    0,                         /* tp_traverse */
01037	    0,                         /* tp_clear */
01038	    0,                         /* tp_richcompare */
01039	    0,                         /* tp_weaklistoffset */
01040	    0,                         /* tp_iter */
01041	    0,                         /* tp_iternext */
01042	    0,//CLazyLinker_methods,       /* tp_methods */
01043	    CLazyLinker_members,       /* tp_members */
01044	    CLazyLinker_getset,        /* tp_getset */
01045	    0,                         /* tp_base */
01046	    0,                         /* tp_dict */
01047	    0,                         /* tp_descr_get */
01048	    0,                         /* tp_descr_set */
01049	    0,                         /* tp_dictoffset */
01050	    (initproc)CLazyLinker_init,/* tp_init */
01051	    0,                         /* tp_alloc */
01052	    CLazyLinker_new,           /* tp_new */
01053	};
01054	
01055	static PyObject * get_version(PyObject *dummy, PyObject *args)
01056	{
01057	  PyObject *result = PyFloat_FromDouble(0.211);
01058	  return result;
01059	}
01060	
01061	static PyMethodDef lazylinker_ext_methods[] = {
01062	  {"get_version",  get_version, METH_VARARGS, "Get extension version."},
01063	  {NULL, NULL, 0, NULL}        /* Sentinel */
01064	};
01065	
01066	#if defined(NPY_PY3K)
01067	static struct PyModuleDef moduledef = {
01068	        PyModuleDef_HEAD_INIT,
01069	        "lazylinker_ext",
01070	        NULL,
01071	        -1,
01072	        lazylinker_ext_methods,
01073	        NULL,
01074	        NULL,
01075	        NULL,
01076	        NULL
01077	};
01078	#endif
01079	#if defined(NPY_PY3K)
01080	#define RETVAL m
01081	PyMODINIT_FUNC
01082	PyInit_lazylinker_ext(void) {
01083	#else
01084	#define RETVAL
01085	PyMODINIT_FUNC
01086	initlazylinker_ext(void) 
01087	{
01088	#endif
01089	    PyObject* m;
01090	
01091	    lazylinker_ext_CLazyLinkerType.tp_new = PyType_GenericNew;
01092	    if (PyType_Ready(&lazylinker_ext_CLazyLinkerType) < 0)
01093	        return RETVAL;
01094	#if defined(NPY_PY3K)
01095	    m = PyModule_Create(&moduledef);
01096	#else
01097	    m = Py_InitModule3("lazylinker_ext", lazylinker_ext_methods,
01098	                       "Example module that creates an extension type.");
01099	#endif
01100	    Py_INCREF(&lazylinker_ext_CLazyLinkerType);
01101	    PyModule_AddObject(m, "CLazyLinker", (PyObject *)&lazylinker_ext_CLazyLinkerType);
01102	
01103	    return RETVAL;
01104	}
01105	
===============================
Problem occurred during compilation with the command line below:
/usr/bin/g++ -shared -g -march=sandybridge -mmmx -mno-3dnow -msse -msse2 -msse3 -mssse3 -mno-sse4a -mcx16 -msahf -mno-movbe -maes -mno-sha -mpclmul -mpopcnt -mno-abm -mno-lwp -mno-fma -mno-fma4 -mno-xop -mno-bmi -mno-bmi2 -mno-tbm -mavx -mno-avx2 -msse4.2 -msse4.1 -mno-lzcnt -mno-rtm -mno-hle -mno-rdrnd -mno-f16c -mno-fsgsbase -mno-rdseed -mno-prfchw -mno-adx -mfxsr -mxsave -mxsaveopt -mno-avx512f -mno-avx512er -mno-avx512cd -mno-avx512pf -mno-prefetchwt1 -mno-clflushopt -mno-xsavec -mno-xsaves -mno-avx512dq -mno-avx512bw -mno-avx512vl -mno-avx512ifma -mno-avx512vbmi -mno-clwb -mno-pcommit -mno-mwaitx --param l1-cache-size=32 --param l1-cache-line-size=64 --param l2-cache-size=6144 -mtune=sandybridge -DNPY_NO_DEPRECATED_API=NPY_1_7_API_VERSION -m64 -fPIC -I/home/covidvu/tmp/COVIDvu/work/lib/python3.7/site-packages/numpy/core/include -I/usr/local/include/python3.7m -I/home/covidvu/tmp/COVIDvu/work/lib/python3.7/site-packages/theano/gof/c_code -L/usr/local/lib -fvisibility=hidden -o /home/covidvu/.theano/compiledir_Linux-4.4--generic-x86_64-with-debian-stretch-sid-x86_64-3.7.5-64/lazylinker_ext/lazylinker_ext.so /home/covidvu/.theano/compiledir_Linux-4.4--generic-x86_64-with-debian-stretch-sid-x86_64-3.7.5-64/lazylinker_ext/mod.cpp -lpython3.7m/usr/bin/ld: /usr/local/lib/libpython3.7m.a(abstract.o): relocation R_X86_64_32S against `_Py_NotImplementedStruct' can not be used when making a shared object; recompile with -fPIC
/usr/local/lib/libpython3.7m.a: error adding symbols: Bad value
collect2: error: ld returned 1 exit status
