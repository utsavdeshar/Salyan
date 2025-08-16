<?php

class imisConfig
{
    public $url="https://imis.hib.gov.np/api/api_fhir/";
    public $login = 'salyhf';
    public $password = '4oNvH06tkCs9vyViuaXf';
    public $remote_user = 'slfhir';

    public function getUrl()
    {
        return $this->url;
    }

    public function getLogin()
    {
        return $this->login;
    }

    public function getPassword()
    {
        return $this->password;
    }

    public function getRemoteUser()
    {
        return $this->remote_user;
    }
    public function getData($url)
    {
        $login = $this->getLogin();
        $password =  $this->getPassword();
        $url = $this->getUrl() . $url;
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL,$url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
        curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
        curl_setopt($ch, CURLOPT_USERPWD, "$login:$password");
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json', 'remote-user:'.$this->getRemoteUser()));
        $result = curl_exec($ch);
        curl_close($ch);  
        return $result;
    }
    public function postData($url,$payload)
    {
        $login = $this->getLogin();
        $password =  $this->getPassword();
        $url = $this->getUrl() . $url;
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL,$url);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload );
        curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
        curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
        curl_setopt($ch, CURLOPT_USERPWD, "$login:$password");
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json', 'remote-user:'.$this->getRemoteUser()));
        $result = curl_exec($ch);
        curl_close($ch);  
        return $result;
    }
}