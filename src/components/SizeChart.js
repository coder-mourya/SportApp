import React from "react";
import "./sizeChart.css"
import pick1 from "./img/size-pick1.png"
import pick2 from "./img/pick2.png";
import pick3 from "./img/pick3.png";
import pick4 from "./img/pick4.png";
import pick5 from "./img/pick5.png";
import pick6 from "./img/pick6.png";
import Contact from "./Contact";



const Chart = () => {
    return (

        <div className="container-fluid g-0">

            <div className="sizeChart d-flex justify-content-center align-items-center text-white">
                <h1>Size chart</h1>
            </div>

            <div className="container">


                <div className="container my-5">

                    <div className="row">

                        <div className="col-md-6 pick1 ">
                            <img src={pick1} alt="pick 1" className="img-fluid" />
                        </div>


                        <div className="col-md-6  ">

                            <table className="charts">
                                <thead>
                                    <tr >
                                        {/* First row highlighting */}
                                        <th>Size</th>
                                        <th>Chest (in)</th>
                                        <th>Waist (in)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* 10 rows */}
                                    <tr>
                                        <td>XS</td>
                                        <td>31-34</td>
                                        <td>28-29</td>
                                    </tr>
                                    <tr>
                                        <td>S</td>
                                        <td>34-37</td>
                                        <td>29-31</td>
                                    </tr>
                                    <tr>
                                        <td>M</td>
                                        <td>34-41</td>
                                        <td>31-34</td>
                                    </tr>
                                    <tr>
                                        <td>L</td>
                                        <td>41-44</td>
                                        <td>34-37</td>
                                    </tr>
                                    <tr>
                                        <td>XL</td>
                                        <td>44-48</td>
                                        <td>37-41</td>
                                    </tr>
                                    <tr>
                                        <td>XXl</td>
                                        <td>48-52</td>
                                        <td>41-45.5</td>
                                    </tr>
                                    <tr>
                                        <td>3XL</td>
                                        <td>52-56</td>
                                        <td>52-56</td>
                                    </tr>
                                    <tr>
                                        <td>4XL</td>
                                        <td>56-60</td>
                                        <td>50-54.4</td>
                                    </tr>
                                    <tr>
                                        <td>5XL</td>
                                        <td>60-64</td>
                                        <td>54.59</td>
                                    </tr>

                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="container my-5">

                    <div className="row">

                        <div className="col-md-6 pick1">
                            <img src={pick2} alt="pick 2" className="img-fluid" />
                        </div>

                        <div className="col-md-6">

                            <table className="charts">
                                <thead>
                                    <tr>
                                        {/* First row highlighting */}
                                        <th>Size</th>
                                        <th>Chest (in)</th>
                                        <th>Waist (in)</th>
                                        <th>Hip(in)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* 10 rows */}
                                    <tr>
                                        <td>XS</td>
                                        <td>28</td>
                                        <td>31-34</td>
                                        <td>28-29</td>
                                    </tr>
                                    <tr>
                                        <td>SM</td>
                                        <td>30</td>
                                        <td>29-31</td>
                                        <td>34-36</td>
                                    </tr>
                                    <tr>
                                        <td>MD</td>
                                        <td>32-33</td>
                                        <td>31-34</td>
                                        <td>36-39</td>
                                    </tr>
                                    <tr>
                                        <td>LG</td>
                                        <td>34-36</td>
                                        <td>34-37</td>
                                        <td>39-42</td>
                                    </tr>
                                    <tr>
                                        <td>XL</td>
                                        <td>38-40</td>
                                        <td>37-41</td>
                                        <td>42-46</td>
                                    </tr>
                                    <tr>
                                        <td>XXL</td>
                                        <td>42-44</td>
                                        <td>41-55.5</td>
                                        <td>46-50</td>
                                    </tr>
                                    <tr>
                                        <td>3XL</td>
                                        <td>46-48</td>
                                        <td>45.5-50</td>
                                        <td>50-54</td>
                                    </tr>
                                    <tr>
                                        <td>4XL</td>
                                        <td>50-52</td>
                                        <td>50-54.5</td>
                                        <td>54-58</td>
                                    </tr>
                                    <tr>
                                        <td>5XL</td>
                                        <td>54-58</td>
                                        <td>54.5-59</td>
                                        <td>58-62</td>
                                    </tr>

                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="container my-5">

                    <div className="row">

                        <div className="col-md-6 pick1">
                            <img src={pick3} alt="pick 3" className="img-fluid" />
                        </div>

                        <div className="col-md-6">

                            <table className="charts">
                                <thead>
                                    <tr>
                                        {/* First row highlighting */}
                                        <th>Size</th>
                                        <th>US size </th>
                                        <th>Chest (in)</th>
                                        <th>Waist(in)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* 10 rows */}
                                    <tr>
                                        <td>XXS</td>
                                        <td>00</td>
                                        <td>31-32.5</td>
                                        <td>25-25.5</td>
                                    </tr>
                                    <tr>
                                        <td>XS</td>
                                        <td>0-2</td>
                                        <td>32.5-33.5</td>
                                        <td>25.5-27</td>
                                    </tr>

                                    <tr>
                                        <td>S</td>
                                        <td>04-06</td>
                                        <td>33.5-36</td>
                                        <td>25.5-27</td>
                                    </tr>
                                    <tr>
                                        <td>M</td>
                                        <td>08-10</td>
                                        <td>36-38</td>
                                        <td>29-31</td>
                                    </tr>

                                    <tr>
                                        <td>L</td>
                                        <td>12-14</td>
                                        <td>38-41</td>
                                        <td>31-34</td>
                                    </tr>
                                    <tr>
                                        <td>XL</td>
                                        <td>16</td>
                                        <td>41-44</td>
                                        <td>34-37</td>

                                    </tr>
                                    <tr>
                                        <td>XXL</td>
                                        <td>18</td>
                                        <td>44-47</td>
                                        <td>37-40</td>
                                    </tr>
                                    <tr>
                                        <td>3XL</td>
                                        <td>20</td>
                                        <td>47-50</td>
                                        <td>40-43</td>
                                    </tr>
                                    <tr>
                                        <td>1X</td>
                                        <td>16W-18W</td>
                                        <td>44-47.5</td>
                                        <td>39-43-5</td>
                                    </tr>
                                    <tr>
                                        <td>2X</td>
                                        <td>20W-22W</td>
                                        <td>47.5-51.5</td>
                                        <td>43.5-48.5</td>

                                    </tr>
                                    <tr>
                                        <td>3X</td>
                                        <td>24W-26W</td>
                                        <td>51.5-55</td>
                                        <td>48.5-53</td>
                                    </tr>

                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>


                <div className="container my-5">

                    <div className="row">

                        <div className="col-md-6 pick1">
                            <img src={pick4} alt="pick 4" className="img-fluid" />
                        </div>

                        <div className="col-md-6">

                            <table className=" charts">
                                <thead>
                                    <tr>
                                        {/* First row highlighting */}
                                        <th>Size</th>
                                        <th>US size(in)</th>
                                        <th>Waist (in)</th>
                                        <th>Hip (in)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* 10 rows */}
                                    <tr>
                                        <td>XXS</td>
                                        <td>00</td>
                                        <td>24.5-25</td>
                                        <td>33-34.5</td>
                                    </tr>
                                    <tr>
                                        <td>XS</td>
                                        <td>0-2</td>
                                        <td>25.5</td>
                                        <td>34.5-36</td>

                                    </tr>

                                    <tr>
                                        <td>S</td>
                                        <td>04-06</td>
                                        <td>27-29</td>
                                        <td>36-38</td>
                                    </tr>
                                    <tr>
                                        <td>M</td>
                                        <td>08-10</td>
                                        <td>29-31</td>
                                        <td>38-40</td>
                                    </tr>
                                    <tr>
                                        <td>L</td>
                                        <td>12-14</td>
                                        <td>31-34</td>
                                        <td>40-43</td>
                                    </tr>
                                    <tr>
                                        <td>XL</td>
                                        <td>16</td>
                                        <td>34-37</td>
                                        <td>43-46</td>
                                    </tr>
                                    <tr>
                                        <td>XXL</td>
                                        <td>18</td>
                                        <td>37-40</td>
                                        <td>46-49</td>
                                    </tr>
                                    <tr>
                                        <td>3XL</td>
                                        <td>20</td>
                                        <td>40-43</td>
                                        <td>49-52</td>
                                    </tr>
                                    <tr>
                                        <td>1X</td>
                                        <td>16W-18W</td>
                                        <td>39-43.5</td>
                                        <td>47-50.5</td>
                                    </tr>
                                    <tr>
                                        <td>2X</td>
                                        <td>20W-11W</td>
                                        <td>43.5-48.5</td>
                                        <td>50.5-54.5</td>

                                    </tr>
                                    <tr>
                                        <td>3X</td>
                                        <td>24W-26W</td>
                                        <td>48.5-53</td>
                                        <td>54.5-58</td>
                                    </tr>

                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>


                <div className="container my-5">

                    <div className="row">

                        <div className="col-md-6 pick1">
                            <img src={pick5} alt="pick 5" className="img-fluid" />
                        </div>

                        <div className="col-md-6">

                            <table className=" charts">
                                <thead>
                                    <tr>
                                        {/* First row highlighting */}
                                        <th>US size</th>
                                        <th>Chest (in)</th>
                                        <th>Waist (in)</th>
                                        <th>Hip(in)</th>
                                        <th>Height (in)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* 10 rows */}

                                    <tr>
                                        <td>YXS 7</td>
                                        <td>25-26</td>
                                        <td>23-24</td>
                                        <td>26-27</td>
                                        <td>47-50</td>
                                    </tr>
                                    <tr>
                                        <td>SYM 8</td>
                                        <td>26-27</td>
                                        <td>24-25</td>
                                        <td>27-28</td>
                                        <td>50.5-53</td>

                                    </tr>
                                    <tr>
                                        <td>YMD 10 - 12</td>
                                        <td>27-29</td>
                                        <td>25-27</td>
                                        <td>28-31</td>
                                        <td>53-59</td>
                                    </tr>
                                    <tr>
                                        <td>YLG 14 - 16</td>
                                        <td>29-32.5</td>
                                        <td>27-30</td>
                                        <td>31-34</td>
                                        <td>59-65</td>
                                    </tr>
                                    <tr>
                                        <td>YXL 18 - 20</td>
                                        <td>32.5-35.5</td>
                                        <td>30-33</td>
                                        <td>34-37</td>
                                        <td>665-70</td>
                                    </tr>

                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>



                <div className="container my-5">

                    <div className="row">

                        <div className="col-md-6 pick1">
                            <img src={pick6} alt="pick 6" className="img-fluid" />
                        </div>

                        <div className="col-md-6 table-container">

                            <table className="charts">
                                <thead>
                                    <tr>
                                        {/* First row highlighting */}
                                        <th>US size</th>
                                        <th>Chest (in)</th>
                                        <th>Waist (in)</th>
                                        <th>Hip (in)</th>
                                        <th>Height (in)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* 10 rows */}
                                    <tr>
                                        <td>YXS 7</td>
                                        <td>25-26</td>
                                        <td>23-24</td>
                                        <td>26-27</td>
                                        <td>47-50.5</td>
                                    </tr>
                                    <tr>
                                        <td>YSM8</td>
                                        <td>26-27</td>
                                        <td>24-25</td>
                                        <td>27-28</td>
                                        <td>50.5-53</td>
                                    </tr>
                                    <tr>
                                        <td>YMD 10 - 12</td>
                                        <td>27-29</td>
                                        <td>25-27</td>
                                        <td>28-31</td>
                                        <td>53-59</td>
                                    </tr>
                                    <tr>
                                        <td>YLG 14 - 16</td>
                                        <td>29-35</td>
                                        <td>27-30</td>
                                        <td>31-34</td>
                                        <td>59-65</td>

                                    </tr>
                                    <tr>
                                        <td>YXL 18 - 20</td>
                                        <td>32.5</td>
                                        <td>30-33</td>
                                        <td>34-37</td>
                                        <td>59-70</td>
                                    </tr>



                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>

            <Contact />
        </div>

    )
}


export default Chart;