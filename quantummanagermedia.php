<?php
/**
 * @package    quantummanagermedia
 * @author     Dmitry Tsymbal <cymbal@delo-design.ru>
 * @copyright  Copyright © 2019 Delo Design & NorrNext. All rights reserved.
 * @license    GNU General Public License version 3 or later; see license.txt
 * @link       https://www.norrnext.com
 */

defined('_JEXEC') or die;

use Joomla\CMS\Application\CMSApplication;
use Joomla\CMS\Factory;
use Joomla\CMS\Form\Form;
use Joomla\CMS\HTML\HTMLHelper;
use Joomla\CMS\Language\Text;
use Joomla\CMS\Layout\FileLayout;
use Joomla\CMS\Plugin\CMSPlugin;
use Joomla\Database\DatabaseDriver;

/**
 * Quantummanagermedia plugin.
 *
 * @package  quantummanagermedia
 * @since    1.0
 */
class plgSystemQuantummanagermedia extends CMSPlugin
{

	/**
	 * Application object
	 *
	 * @var    CMSApplication
	 * @since  1.0
	 */
	protected $app;


	/**
	 * Database object
	 *
	 * @var    DatabaseDriver
	 * @since  1.0
	 */
	protected $db;


	/**
	 * Affects constructor behavior. If true, language files will be loaded automatically.
	 *
	 * @var    boolean
	 * @since  1.0
	 */
	protected $autoloadLanguage = true;


	public function onAfterRoute()
	{
		if (!$this->accessCheck())
		{
			return;
		}

		if (
			(
				$this->app->input->get('option') === 'com_media' &&
				$this->app->input->get('view') === 'images'
			) ||
			$this->app->input->getString('qm', '0') === '1'
		)
		{
			$data           = $this->app->input->getArray();
			$data['option'] = 'com_ajax';
			$data['plugin'] = 'quantummanagermedia';
			$data['format'] = 'html';
			$data['tmpl']   = 'component';

			$this->app->redirect('index.php?' . http_build_query($data));
		}


	}


	public function onBeforeRender()
	{
		if (!$this->accessCheck())
		{
			return;
		}

		$data = $this->app->input->getArray();

		HTMLHelper::_('stylesheet', 'com_quantummanager/modalhelper.css', [
			'version'  => filemtime(__FILE__),
			'relative' => true
		]);

	}


	/**
	 * Adds addition meta title
	 *
	 * @param   JForm  $form  The form to be altered.
	 * @param   mixed  $data  The associated data for the form.
	 *
	 * @return  boolean
	 *
	 * @since   1.0
	 */
	function onContentPrepareForm($form, $data)
	{
		$component       = $this->app->input->get('option');
		$view            = $this->app->input->get('view');
		$enableMedia     = (int) $this->params->get('enablemedia', 1);
		$enablemediapath = $this->params->get('enablemediapath', '');
		$path            = '';

		JLoader::register('QuantummanagerHelper', JPATH_SITE . '/administrator/components/com_quantummanager/helpers/quantummanager.php');

		$scopes       = QuantummanagerHelper::getAllScope();
		$scope_images = new stdClass();
		foreach ($scopes as $scope)
		{
			if ($scope->id === 'images')
			{
				$path = QuantummanagerHelper::preparePath($scope->path, false, $scope->id);
			}
		}

		if (!empty($enablemediapath))
		{
			$path = 'images/' . $enablemediapath;
		}

		$enablemediapreview = !(int) $this->params->get('enablemediapreview', 1);

		if ($this->accessCheck() && $enableMedia)
		{
			$enableMediaComponents = $this->params->get('enablemediaadministratorcomponents', ['com_content.article', 'com_content.form']);

			if (!is_array($enableMediaComponents))
			{
				$enableMediaComponents = ['com_content.article', 'com_content.form'];
			}

			if (in_array($component . '.' . $view, $enableMediaComponents, true))
			{
				Form::addFieldPath(JPATH_ROOT . '/libraries/lib_fields/fields/quantumuploadimage');

				if ($component !== 'com_content')
				{
					foreach ($form->getFieldsets() as $fieldset)
					{
						foreach ($form->getFieldset($fieldset->name) as $field)
						{
							$type  = $field->__get('type');
							$name  = $field->__get('fieldname');
							$group = $field->__get('group');

							if (strtolower($type) === 'media')
							{
								$form->setFieldAttribute($name, 'type', 'quantumuploadimage', $group);
								$form->setFieldAttribute($name, 'addfieldpath', '/libraries/lib_fields/fields/quantumuploadimage', $group);
								$form->setFieldAttribute($name, 'directory', $path, $group);
								$form->setFieldAttribute($name, 'dropAreaHidden', $enablemediapreview, $group);
							}
							if (strtolower($type) === 'subform')
							{
								$formsource = $field->__get('formsource');
								if(!is_null($formsource) && trim($formsource) !== '') {
									$subformxml = new SimpleXMLElement($formsource);
									$this->fixForComContent($subformxml);
									$formsource_modified = $subformxml->asXML();
									$form->setFieldAttribute($name, 'formsource', $formsource_modified, $group);
								}
							}

						}
					}
				}
				else
				{
					$xml = $form->getXml();
					$this->fixForComContent($xml);
				}

			}
		}

		if ($this->app->isClient('administrator'))
		{
			$this->addCssForButtonImage();
		}

		return true;
	}


	public function onAjaxQuantummanagermedia()
	{
		if (!$this->accessCheck())
		{
			return;
		}

		JLoader::register('QuantummanagerHelper', JPATH_ROOT . '/administrator/components/com_quantummanager/helpers/quantummanager.php');
		QuantummanagerHelper::loadlang();
		$layout = new FileLayout('default', JPATH_ROOT . DIRECTORY_SEPARATOR . implode(DIRECTORY_SEPARATOR, [
				'plugins', 'system', 'quantummanagermedia', 'tmpl'
			]));
		echo $layout->render();
	}


	/**
	 * @param                     $base
	 * @param   SimpleXMLElement  $node
	 */
	protected function fixForComContent(SimpleXMLElement &$node)
	{
		$childNodes         = $node->children();
		$enablemediapath    = $this->params->get('enablemediapath', '');
		$enablemediapreview = (int) $this->params->get('enablemediapreview', 1);
		$path               = '';

		JLoader::register('QuantummanagerHelper', JPATH_SITE . '/administrator/components/com_quantummanager/helpers/quantummanager.php');

		$scopes       = QuantummanagerHelper::getAllScope();
		$scope_images = new stdClass();
		foreach ($scopes as $scope)
		{
			if ($scope->id === 'images')
			{
				$path = QuantummanagerHelper::preparePath($scope->path, false, $scope->id);

			}
		}

		if (!empty($enablemediapath))
		{
			$path = 'images/' . $enablemediapath;
		}


		if ($node->getName() === 'field')
		{
			foreach ($node->attributes() as $a => $b)
			{
				if (
					((string) $a === 'type' && (string) $b === 'media')
					//|| ((string) $a === 'type' && (string) $b === 'accessiblemedia')
				)
				{
					$node['addfieldpath']   = '/libraries/lib_fields/fields/quantumuploadimage';
					$node['type']           = 'quantumuploadimage';
					$node['directory']      = $path;
					$node['dropAreaHidden'] = !$enablemediapreview;
				}
			}
		}

		if (count($childNodes) > 0)
		{
			foreach ($childNodes as $chNode)
			{
				$this->fixForComContent($chNode);
			}
		}
	}


	protected function addCssForButtonImage()
	{
		if (
			($this->app->getDocument() === null) ||
			$this->app->getDocument()->getType() !== 'html'
		)
		{
			return;
		}

		Factory::getLanguage()->load('plg_editors-xtd_image', JPATH_ADMINISTRATOR);
		$label = Text::_('PLG_IMAGE_BUTTON_IMAGE');
		Factory::getDocument()->addStyleDeclaration(<<<EOT
@media screen and (min-width: 1540px) {
	.mce-window[aria-label="{$label}"] {
		top: 10% !important;
		left: calc((100% - 1400px)/2) !important;
		width: 1400px !important;
		height: 80% !important;
	}
	
	.mce-window[aria-label="{$label}"] .mce-reset
	{
		width: 100% !important;
		height: 100% !important;
	}
	
	.mce-window[aria-label="{$label}"] .mce-window-body {
		width: 100% !important;
		height: calc(100% - 96px) !important;
	}
	
	.mce-window[aria-label="{$label}"] .mce-foot {
		width: 100% !important;
	}
	
	.mce-window[aria-label="{$label}"] .mce-foot .mce-container-body {
		width: 100% !important;
	}
	
	.mce-window[aria-label="{$label}"] .mce-foot .mce-container-body .mce-widget {
		left: auto !important;
		right: 18px !important;
	}
}

@media screen and (max-width: 1540px) {
	.mce-window[aria-label="{$label}"] {
		left: 2% !important;
		right: 0 !important;
		width: 95% !important;
	}
	
	.mce-window[aria-label="{$label}"] .mce-reset
	{
		width: 100% !important;
		height: 100% !important;
	}
	
	.mce-window[aria-label="{$label}"] .mce-window-body {
		width: 100% !important;
		height: calc(100% - 96px) !important;
	}
	
	.mce-window[aria-label="{$label}"] .mce-foot {
		width: 100% !important;
	}
	
	.mce-window[aria-label="{$label}"] .mce-foot .mce-container-body {
		width: 100% !important;
	}
	
	.mce-window[aria-label="{$label}"] .mce-foot .mce-container-body .mce-widget {
		left: auto !important;
		right: 18px !important;
	}
}

@media screen and (max-height: 700px) {

	.mce-window[aria-label="{$label}"] {
		top: 2% !important;
		height: 95% !important;
	}
		
	.mce-window[aria-label="{$label}"] .mce-window-body {
		height: calc(100% - 96px) !important;
	}
			
}


EOT
		);

		Factory::getDocument()->addScriptDeclaration("window.QuantumwindowPluginMediaLang = { label: '" . $label . "'};");
		HTMLHelper::_('script', 'plg_system_quantummanagermedia/largeforimagebutton.js', [
			'version'  => filemtime(__FILE__),
			'relative' => true
		]);
	}


	protected function accessCheck()
	{

		if ($this->app->isClient('administrator'))
		{
			return true;
		}

		// проверяем на включенность параметра
		JLoader::register('QuantummanagerHelper', JPATH_ADMINISTRATOR . '/components/com_quantummanager/helpers/quantummanager.php');

		if (!(int) QuantummanagerHelper::getParamsComponentValue('front', 0))
		{
			return false;
		}

		// проверяем что пользователь авторизован
		if (Factory::getUser()->id === 0)
		{
			return false;
		}

		return true;
	}

}
